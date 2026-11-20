import { z } from "zod"
import { matchesAccept } from "../lib/accept"
import { CAPTURE_MAX_BYTES, attachFile, getForUpload } from "./store"

/*
 * What the phone may call. Served from a fixed path (/api/capture/$id) rather
 * than a server function, so the desktop app's LAN gate can let only these
 * requests through.
 */

const EXPIRED = "This link has expired. Make a new code on your computer."

export type CaptureInfo = { accept: string; expiresAt: number }

export class CaptureError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
  }
}

/** What the phone may upload, or null when the link is dead. */
export function readCaptureInfo(id: string, token: string): CaptureInfo | null {
  const session = getForUpload(id, token)
  if (!session) return null
  return { accept: session.accept, expiresAt: session.expiresAt }
}

const uploadSchema = z.object({
  token: z.string().min(20).max(200),
  file: z
    .instanceof(File, { message: "Choose a file" })
    .refine((file) => file.size > 0, "The file is empty")
    .refine(
      (file) => file.size <= CAPTURE_MAX_BYTES,
      `The file must be ${CAPTURE_MAX_BYTES / 1024 / 1024} MB or smaller`
    ),
})

/** Checks the phone's FormData { token, file } and hands the file to the session. */
export async function acceptUpload(id: string, form: FormData) {
  const parsed = uploadSchema.safeParse({
    token: form.get("token"),
    file: form.get("file"),
  })
  if (!parsed.success) {
    throw new CaptureError(parsed.error.issues[0]?.message ?? "Invalid upload", 400)
  }
  const { token, file } = parsed.data

  const session = getForUpload(id, token)
  if (!session) throw new CaptureError(EXPIRED, 404)
  if (!matchesAccept(file, session.accept)) {
    throw new CaptureError("This type of file is not allowed here", 415)
  }
  const attached = attachFile(id, token, {
    name: file.name || "capture",
    type: file.type,
    bytes: await file.arrayBuffer(),
  })
  if (!attached) throw new CaptureError(EXPIRED, 404)
}
