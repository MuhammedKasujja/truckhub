import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as AxiosModule from "axios"

const post = vi.fn()

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof AxiosModule>()
  const instance = () =>
    Object.assign(vi.fn(), {
      post,
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    })
  return { ...actual, default: { ...actual.default, create: instance } }
})

vi.mock("../../src/features/auth/services", () => ({
  getSession: vi.fn(),
  clearSession: vi.fn(),
  updateSession: vi.fn(),
}))

vi.mock("../../src/lib/logger", () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn() },
  jsonFormatter: (v: unknown) => v,
}))

const tokens = (n: number) => ({
  access_token: `access-${n}`,
  refresh_token: `refresh-${n}`,
  expires_in: 900,
})

describe("refreshTokens", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    post.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it("reuses a finished refresh for the same token within a minute", async () => {
    post.mockResolvedValue({ data: { data: tokens(1) } })
    const { refreshTokens } = await import("../../src/lib/api")

    await expect(refreshTokens("old")).resolves.toEqual(tokens(1))
    // A stale cookie still carrying "old" must not hit the backend again
    await expect(refreshTokens("old")).resolves.toEqual(tokens(1))
    expect(post).toHaveBeenCalledTimes(1)
  })

  it("refreshes again once the cached result expires", async () => {
    post.mockResolvedValue({ data: tokens(1) })
    const { refreshTokens } = await import("../../src/lib/api")

    await refreshTokens("old")
    await vi.advanceTimersByTimeAsync(60_001)
    await refreshTokens("old")
    expect(post).toHaveBeenCalledTimes(2)
  })

  it("does not cache a failed refresh", async () => {
    post.mockRejectedValueOnce(new Error("timeout"))
    post.mockResolvedValueOnce({ data: tokens(2) })
    const { refreshTokens } = await import("../../src/lib/api")

    await expect(refreshTokens("old")).rejects.toThrow("timeout")
    await expect(refreshTokens("old")).resolves.toEqual(tokens(2))
    expect(post).toHaveBeenCalledTimes(2)
  })
})
