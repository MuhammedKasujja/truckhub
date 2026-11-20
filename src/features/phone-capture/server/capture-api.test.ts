import { beforeEach, describe, expect, it } from "vitest"
import { CaptureError, acceptUpload, readCaptureInfo } from "./capture-api"
import { _resetStore, createSession, takeFile } from "./store"

const form = (token: string, file?: File) => {
  const fd = new FormData()
  fd.set("token", token)
  if (file) fd.set("file", file)
  return fd
}
const photo = () => new File(["jpeg"], "a.jpg", { type: "image/jpeg" })

describe("phone capture API", () => {
  beforeEach(() => _resetStore())

  it("reads the session only with the right token", () => {
    const s = createSession("u1")
    expect(readCaptureInfo(s.id, s.uploadToken)?.accept).toBe(s.accept)
    expect(readCaptureInfo(s.id, "x".repeat(43))).toBeNull()
  })

  it("accepts one upload and hands it to the owner", async () => {
    const s = createSession("u1")
    await acceptUpload(s.id, form(s.uploadToken, photo()))
    expect(takeFile(s.id, "u1")?.name).toBe("a.jpg")
  })

  it("rejects a second upload to the same link", async () => {
    const s = createSession("u1")
    await acceptUpload(s.id, form(s.uploadToken, photo()))
    await expect(acceptUpload(s.id, form(s.uploadToken, photo()))).rejects.toMatchObject({
      status: 404,
    })
  })

  it("rejects file types the session doesn't accept", async () => {
    const s = createSession("u1", "application/pdf")
    await expect(acceptUpload(s.id, form(s.uploadToken, photo()))).rejects.toMatchObject({
      status: 415,
    })
  })

  it("rejects a missing file", async () => {
    const s = createSession("u1")
    await expect(acceptUpload(s.id, form(s.uploadToken))).rejects.toBeInstanceOf(CaptureError)
  })
})
