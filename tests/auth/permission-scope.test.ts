import { describe, expect, it } from "vitest"
import type { User } from "@/features/auth/types"
import {
  checkResourcePermission,
  checkUserPermission,
  getPermissionScope,
} from "@/lib/permissions"
import { ModuleAccess } from "@/features/auth/permissions"

const ME = "user-me"
const OTHER = "user-other"

const user = (permissions: string[], is_admin = false): User => ({
  id: ME,
  name: "Test User",
  email: "test@example.com",
  is_admin,
  permissions,
})

// "quotations:edit" grants ["quotations:update", "quotations:view"]
describe("getPermissionScope", () => {
  it("gives admins any scope", () => {
    expect(getPermissionScope(user([], true), "quotations:edit")).toBe("any")
  })

  it("is any when every API permission is held as-is", () => {
    const u = user(["quotations:update", "quotations:view"])
    expect(getPermissionScope(u, "quotations:edit")).toBe("any")
  })

  it("is own when some API permissions are only held as :own", () => {
    const u = user(["quotations:update:own", "quotations:view"])
    expect(getPermissionScope(u, "quotations:edit")).toBe("own")
  })

  it("is own when every API permission is held as :own", () => {
    const u = user(["quotations:update:own", "quotations:view:own"])
    expect(getPermissionScope(u, "quotations:edit")).toBe("own")
  })

  it("is null when an API permission is missing in both forms", () => {
    const u = user(["quotations:update:own"])
    expect(getPermissionScope(u, "quotations:edit")).toBeNull()
    expect(checkUserPermission(u)("quotations:edit")).toBe(false)
  })

  it("opens keys with no API permissions to every signed-in user", () => {
    // "me:view": [] guards self-service (My HR); an early `length === 0`
    // check once locked every non-admin out of it
    const u = user([])
    expect(getPermissionScope(u, "me:view")).toBe("any")
    expect(checkUserPermission(u)("me:view")).toBe(true)
    expect(checkResourcePermission(u)("me:view", { created_by: OTHER })).toBe(
      true
    )
  })
})

describe("checkResourcePermission", () => {
  const ownOnly = user(["quotations:update:own", "quotations:view"])
  const can = checkResourcePermission(ownOnly)

  it("allows :own holders on records they created", () => {
    expect(can("quotations:edit", { created_by: ME })).toBe(true)
  })

  it("blocks :own holders on someone else's record", () => {
    expect(can("quotations:edit", { created_by: OTHER })).toBe(false)
  })

  it("blocks :own holders when the record has no creator", () => {
    expect(can("quotations:edit", { created_by: null })).toBe(false)
  })

  it("allows any holders on every record", () => {
    const full = user(["quotations:update", "quotations:view"])
    expect(
      checkResourcePermission(full)("quotations:edit", { created_by: OTHER })
    ).toBe(true)
  })

  it("prefers the server's can flags", () => {
    expect(
      can("quotations:edit", {
        created_by: OTHER,
        can: { "quotations:update": true, "quotations:view": true },
      })
    ).toBe(true)
    expect(
      can("quotations:edit", {
        created_by: ME,
        can: { "quotations:update": false, "quotations:view": true },
      })
    ).toBe(false)
  })

  it("falls back to permissions when the server sends no can flags", () => {
    expect(can("quotations:edit", {})).toBe(false)
    const full = user(["quotations:update", "quotations:view"])
    expect(checkResourcePermission(full)("quotations:edit", {})).toBe(true)
  })
})

describe("several keys (ModuleAccess)", () => {
  it("needs every key: the module flag and its data key", () => {
    expect(
      checkUserPermission(user(["quotations:module"]))(ModuleAccess.quotations)
    ).toBe(false)
    expect(
      checkUserPermission(user(["quotations:view", "quotations:read"]))(
        ModuleAccess.quotations
      )
    ).toBe(false)
  })

  it("is any when every key is any", () => {
    const u = user(["quotations:module", "quotations:view", "quotations:read"])
    expect(getPermissionScope(u, ModuleAccess.quotations)).toBe("any")
  })

  it("is own when any key is only own", () => {
    const u = user([
      "quotations:module",
      "quotations:view:own",
      "quotations:read:own",
    ])
    expect(getPermissionScope(u, ModuleAccess.quotations)).toBe("own")
  })

  it("lets admins in", () => {
    expect(getPermissionScope(user([], true), ModuleAccess.quotations)).toBe(
      "any"
    )
  })
})
