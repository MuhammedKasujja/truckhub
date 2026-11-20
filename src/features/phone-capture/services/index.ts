import { createServerFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"
import { z } from "zod"
import { matchesAccept } from "../lib/accept"
import {
  CAPTURE_MAX_BYTES,
  DEFAULT_ACCEPT,
  attachFile,
  createSession,
  deleteSession,
  getForOwner,
  getForUpload,
  takeFile,
} from "../server/store"
import { formInput } from "@/lib/form-utils"
import { useAppSession } from "@/lib/session"
import { ApiError } from "@/types"

/*
 * None of these call the FastAPI backend. The phone has no login session, so
 * the upload is checked against the session's one-time token instead.
 */

async function requireUserId() {
  const session = await useAppSession()
  const user = session.data.user as { id: string | number } | undefined
  if (!user) {
    throw new ApiError("Sign in to use your phone camera", 401)
  }
  return String(user.id)
}

function appOrigin() {
  const configured = process.env.PUBLIC_APP_URL
  if (configured) return configured.replace(/\/+$/, "")
  return getRequestUrl({ xForwardedHost: true }).origin
}

const sessionIdSchema = z.object({ id: z.uuid() })

export const createCaptureSessionFn = createServerFn({ method: "POST" })
  .validator(z.object({ accept: z.string().max(500).optional() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const session = createSession(userId, data.accept || DEFAULT_ACCEPT)
    const url = new URL(`/capture/${session.id}`, appOrigin())
    url.searchParams.set("t", session.uploadToken)
    return { id: session.id, url: url.toString(), expiresAt: session.expiresAt }
  })

export type CaptureStatus = "pending" | "ready" | "expired"

export const getCaptureStatusFn = createServerFn({ method: "GET" })
  .validator(sessionIdSchema)
  .handler(async ({ data }): Promise<{ status: CaptureStatus }> => {
    const userId = await requireUserId()
    const session = getForOwner(data.id, userId)
    if (!session) return { status: "expired" }
    return { status: session.file ? "ready" : "pending" }
  })

/** Sends the file to the desktop once, then the session is gone. */
export const takeCaptureFileFn = createServerFn({ method: "GET" })
  .validator(sessionIdSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const file = takeFile(data.id, userId)
    if (!file) throw new ApiError("The file is no longer available", 404)
    return new Response(file.bytes, {
      status: 200,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  })

export const cancelCaptureSessionFn = createServerFn({ method: "POST" })
  .validator(sessionIdSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    deleteSession(data.id, userId)
    return { ok: true }
  })

const tokenSchema = sessionIdSchema.extend({ token: z.string().min(20).max(200) })

/** For the phone page: what it may upload, or null when the link is dead. */
export const getCaptureInfoFn = createServerFn({ method: "GET" })
  .validator(tokenSchema)
  .handler(({ data }) => {
    const session = getForUpload(data.id, data.token)
    if (!session) return null
    return { accept: session.accept, expiresAt: session.expiresAt }
  })

const uploadSchema = z.object({
  id: z.uuid(),
  token: z.string().min(20).max(200),
  file: z
    .instanceof(File, { message: "Choose a file" })
    .refine((file) => file.size > 0, "The file is empty")
    .refine(
      (file) => file.size <= CAPTURE_MAX_BYTES,
      `The file must be ${CAPTURE_MAX_BYTES / 1024 / 1024} MB or smaller`
    ),
})

/** Public: the phone sends FormData { id, token, file }. */
export const uploadCaptureFn = createServerFn({ method: "POST" })
  .validator(formInput(uploadSchema))
  .handler(async ({ data }) => {
    const session = getForUpload(data.id, data.token)
    if (!session) {
      throw new ApiError("This link has expired. Make a new code on your computer.", 404)
    }
    if (!matchesAccept(data.file, session.accept)) {
      throw new ApiError("This type of file is not allowed here", 415)
    }
    const attached = attachFile(data.id, data.token, {
      name: data.file.name || "capture",
      type: data.file.type,
      bytes: await data.file.arrayBuffer(),
    })
    if (!attached) {
      throw new ApiError("This link has expired. Make a new code on your computer.", 404)
    }
    return { ok: true }
  })
