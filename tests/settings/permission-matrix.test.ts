import { describe, expect, it } from "vitest"
import {
  allPermissionKeys,
  changedKeys,
  disableKeys,
  enableKeys,
  isKeyOn,
  keysIncluding,
} from "@/features/settings/permissions/permission-matrix"

const key = (name: string) => {
  const found = allPermissionKeys.find((k) => k.key === name)
  if (!found) throw new Error(`unknown permission key ${name}`)
  return found
}

describe("permission matrix", () => {
  it("turns a named permission on by adding all its API permissions", () => {
    const next = enableKeys(new Set(), [key("users:view")])
    expect([...next].sort()).toEqual(["users:read", "users:view"])
    expect(isKeyOn(next, key("users:view"))).toBe(true)
  })

  it("can switch off a permission the role already had when loaded", () => {
    // The old screen could never remove permissions loaded from a role.
    const saved = new Set(["users:update"])
    expect(isKeyOn(saved, key("users:edit"))).toBe(true)
    const next = disableKeys(saved, [key("users:edit")])
    expect(next.has("users:update")).toBe(false)
  })

  it("keeps API permissions another enabled key still needs", () => {
    // config:edit and config:view share settings:view.
    const both = enableKeys(new Set(), [key("config:edit"), key("config:view")])
    const next = disableKeys(both, [key("config:view")])
    expect(isKeyOn(next, key("config:edit"))).toBe(true)
    expect(isKeyOn(next, key("config:view"))).toBe(false)
    expect(next.has("settings:view")).toBe(true)
    expect(next.has("settings:read")).toBe(false)
  })

  it("reports a key covered by a broader enabled key", () => {
    const set = enableKeys(new Set(), [key("config:user:management")])
    expect(isKeyOn(set, key("users:view"))).toBe(true)
    expect(keysIncluding(set, key("users:view")).map((k) => k.key)).toContain(
      "config:user:management"
    )
  })

  it("leaves API permissions that no named key knows about", () => {
    const next = disableKeys(new Set(["users:update", "legacy:thing"]), [
      key("users:edit"),
    ])
    expect(next.has("legacy:thing")).toBe(true)
  })

  it("lists changed keys between two sets", () => {
    const saved = new Set<string>()
    const draft = enableKeys(saved, [key("users:delete")])
    expect(changedKeys(draft, saved).map((k) => k.key)).toEqual([
      "users:delete",
    ])
  })
})
