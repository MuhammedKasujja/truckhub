import { beforeEach, describe, expect, it } from "vitest"
import { matchesAccept } from "../lib/accept"
import {
  CAPTURE_TTL_MS,
  MAX_OPEN_SESSIONS_PER_USER,
  _resetStore,
  attachFile,
  createSession,
  getForOwner,
  getForUpload,
  takeFile,
} from "./store"

const file = { name: "a.jpg", type: "image/jpeg", bytes: new ArrayBuffer(4) }

describe("phone capture store", () => {
  beforeEach(() => _resetStore())

  it("hands the file to its owner once", () => {
    const s = createSession("u1")
    expect(attachFile(s.id, s.uploadToken, file)).toBe(true)
    expect(getForOwner(s.id, "u1")?.file).toBeDefined()
    expect(takeFile(s.id, "u1")).toEqual(file)
    expect(takeFile(s.id, "u1")).toBeUndefined()
  })

  it("rejects a wrong token and a second upload", () => {
    const s = createSession("u1")
    expect(attachFile(s.id, "x".repeat(43), file)).toBe(false)
    expect(attachFile(s.id, s.uploadToken, file)).toBe(true)
    expect(attachFile(s.id, s.uploadToken, file)).toBe(false)
    expect(getForUpload(s.id, s.uploadToken)).toBeUndefined()
  })

  it("hides the session from other users", () => {
    const s = createSession("u1")
    attachFile(s.id, s.uploadToken, file)
    expect(getForOwner(s.id, "u2")).toBeUndefined()
    expect(takeFile(s.id, "u2")).toBeUndefined()
  })

  it("expires after the time limit", () => {
    const now = Date.now()
    const s = createSession("u1", undefined, now)
    const later = now + CAPTURE_TTL_MS + 1
    expect(getForUpload(s.id, s.uploadToken, later)).toBeUndefined()
    expect(getForOwner(s.id, "u1", later)).toBeUndefined()
  })

  it("drops the oldest session past the per-user limit", () => {
    const first = createSession("u1", undefined, 1)
    for (let i = 0; i < MAX_OPEN_SESSIONS_PER_USER; i++) {
      createSession("u1", undefined, 2 + i)
    }
    expect(getForOwner(first.id, "u1", 10)).toBeUndefined()
  })
})

describe("matchesAccept", () => {
  it("handles extensions, wildcards and exact types", () => {
    const pdf = { name: "Doc.PDF", type: "application/pdf" }
    const jpg = { name: "p.jpg", type: "image/jpeg" }
    expect(matchesAccept(pdf, ".jpg,.png,.pdf")).toBe(true)
    expect(matchesAccept(jpg, "image/*")).toBe(true)
    expect(matchesAccept(pdf, "image/*")).toBe(false)
    expect(matchesAccept(pdf, "application/pdf")).toBe(true)
  })
})
