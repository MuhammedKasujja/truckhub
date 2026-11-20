import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto"

/**
 * Short-lived, in-memory hand-off between a desktop browser and a phone.
 * The app runs as a single Node process, so a Map is enough; swap this module
 * for Redis if the app is ever scaled to several instances.
 */

export const CAPTURE_TTL_MS = 10 * 60 * 1000
export const CAPTURE_MAX_BYTES = 10 * 1024 * 1024
export const MAX_OPEN_SESSIONS_PER_USER = 5
export const DEFAULT_ACCEPT = "image/*,application/pdf"

export type CapturedFile = {
  name: string
  type: string
  bytes: ArrayBuffer
}

export type CaptureSession = {
  id: string
  uploadToken: string
  userId: string
  accept: string
  createdAt: number
  expiresAt: number
  file?: CapturedFile
}

type Store = { sessions: Map<string, CaptureSession>; sweeper?: NodeJS.Timeout }

// Kept on globalThis so dev-server reloads do not drop open sessions
const globalStore = globalThis as typeof globalThis & {
  __phoneCaptureStore?: Store
}
const store: Store = (globalStore.__phoneCaptureStore ??= {
  sessions: new Map(),
})

if (!store.sweeper) {
  store.sweeper = setInterval(() => sweep(), 60_000)
  store.sweeper.unref()
}

export function sweep(now = Date.now()) {
  for (const [id, session] of store.sessions) {
    if (session.expiresAt <= now) store.sessions.delete(id)
  }
}

function live(id: string, now = Date.now()) {
  const session = store.sessions.get(id)
  if (!session) return undefined
  if (session.expiresAt <= now) {
    store.sessions.delete(id)
    return undefined
  }
  return session
}

function sameToken(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function createSession(
  userId: string,
  accept = DEFAULT_ACCEPT,
  now = Date.now()
) {
  sweep(now)
  const open = [...store.sessions.values()]
    .filter((s) => s.userId === userId)
    .sort((a, b) => a.createdAt - b.createdAt)
  // Drop the oldest so a user who keeps reopening the dialog is never blocked
  while (open.length >= MAX_OPEN_SESSIONS_PER_USER) {
    store.sessions.delete(open.shift()!.id)
  }

  const session: CaptureSession = {
    id: randomUUID(),
    uploadToken: randomBytes(32).toString("base64url"),
    userId,
    accept,
    createdAt: now,
    expiresAt: now + CAPTURE_TTL_MS,
  }
  store.sessions.set(session.id, session)
  return session
}

/** For the phone: the session, if the token matches and nothing is uploaded yet. */
export function getForUpload(id: string, token: string, now = Date.now()) {
  const session = live(id, now)
  if (!session || !sameToken(session.uploadToken, token)) return undefined
  if (session.file) return undefined
  return session
}

/** For the desktop: the session, only to the user who opened it. */
export function getForOwner(id: string, userId: string, now = Date.now()) {
  const session = live(id, now)
  if (!session || session.userId !== userId) return undefined
  return session
}

export function attachFile(
  id: string,
  token: string,
  file: CapturedFile,
  now = Date.now()
) {
  const session = getForUpload(id, token, now)
  if (!session) return false
  session.file = file
  return true
}

/** Hands the file to its owner once, then forgets the session. */
export function takeFile(id: string, userId: string, now = Date.now()) {
  const session = getForOwner(id, userId, now)
  if (!session?.file) return undefined
  store.sessions.delete(id)
  return session.file
}

export function deleteSession(id: string, userId: string) {
  const session = store.sessions.get(id)
  if (session?.userId === userId) store.sessions.delete(id)
}

/** Test helper. */
export function _resetStore() {
  store.sessions.clear()
}
