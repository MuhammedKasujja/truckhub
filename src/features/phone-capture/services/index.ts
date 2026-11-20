import { createServerFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"
import { z } from "zod"
import { readCaptureInfo } from "../server/capture-api"
import { lanIp } from "../server/lan-ip"
import {
  DEFAULT_ACCEPT,
  createSession,
  deleteSession,
  getForOwner,
  takeFile,
} from "../server/store"
import { useAppSession } from "@/lib/session"
import { ApiError } from "@/types"

/*
 * None of these call the FastAPI backend. The phone's calls live in
 * ../server/capture-api.ts, served at /api/capture/$id, and are checked
 * against the session's one-time token since the phone has no login.
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
  // Desktop app: the phone reaches this computer directly over Wi-Fi through
  // the LAN gate (scripts/desktop-entry.mjs), not the hosted site
  const capturePort = process.env.CAPTURE_PORT
  if (process.env.TRUCKHUB_DESKTOP && capturePort) {
    const ip = lanIp()
    if (!ip) {
      throw new ApiError("Connect this computer to Wi-Fi to use your phone", 409)
    }
    return `http://${ip}:${capturePort}`
  }
  const configured = process.env.PUBLIC_APP_URL
  if (configured) return configured.replace(/\/+$/, "")
  return getRequestUrl({ xForwardedHost: true }).origin
}

const sessionIdSchema = z.object({ id: z.uuid() })

export const createCaptureSessionFn = createServerFn({ method: "POST" })
  .validator(z.object({ accept: z.string().max(500).optional() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    // Before creating the session, so a missing network leaves nothing behind
    const origin = appOrigin()
    const session = createSession(userId, data.accept || DEFAULT_ACCEPT)
    const url = new URL(`/capture/${session.id}`, origin)
    url.searchParams.set("t", session.uploadToken)
    return {
      id: session.id,
      url: url.toString(),
      expiresAt: session.expiresAt,
      sameWifi: !!process.env.TRUCKHUB_DESKTOP,
    }
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

/** For the phone page's server render. The browser uses /api/capture/$id. */
export const getCaptureInfoFn = createServerFn({ method: "GET" })
  .validator(tokenSchema)
  .handler(({ data }) => readCaptureInfo(data.id, data.token))
