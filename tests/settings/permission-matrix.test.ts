import { describe, expect, it } from "vitest"
import {
  allPermissionKeys,
  canSetKeyScope,
  changedKeys,
  countEnabledKeys,
  disableKeys,
  enableKeys,
  isKeyOn,
  isScopable,
  keyScope,
  keysIncluding,
  ownableFrom,
  setKeyScope,
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

// Real keys: quotations:edit = update + view, quotations:view = view + read,
// reports:quotations:view = reports:module + quotations:read (reports:module
// has no ":own" form). Module keys grant only their *:module flag.
describe("permission matrix: own vs any", () => {
  const ownable = ownableFrom([
    "quotations:module",
    "quotations:read",
    "quotations:read:own",
    "quotations:view",
    "quotations:view:own",
    "quotations:update",
    "quotations:update:own",
  ])
  const sorted = (set: ReadonlySet<string>) => [...set].sort()

  it("reads ownable API permissions from the backend list", () => {
    expect(sorted(ownable)).toEqual([
      "quotations:read",
      "quotations:update",
      "quotations:view",
    ])
  })

  it("offers own only for keys with an ownable grant", () => {
    expect(isScopable(key("quotations:edit"), ownable)).toBe(true)
    expect(isScopable(key("reports:quotations:view"), ownable)).toBe(true)
    expect(isScopable(key("users:view"), ownable)).toBe(false)
    // Module keys are frontend-only flags, so always a plain switch
    expect(isScopable(key("quotations:module"), ownable)).toBe(false)
  })

  it("sets a key to own with the :own form of each grant", () => {
    const next = setKeyScope(new Set(), key("quotations:edit"), "own", ownable)
    expect(sorted(next)).toEqual([
      "quotations:update:own",
      "quotations:view:own",
    ])
    expect(keyScope(next, key("quotations:edit"))).toBe("own")
    expect(isKeyOn(next, key("quotations:edit"))).toBe(true)
  })

  it("replaces the :own forms when widening to any", () => {
    const own = setKeyScope(new Set(), key("quotations:edit"), "own", ownable)
    const any = setKeyScope(own, key("quotations:edit"), "any", ownable)
    expect(sorted(any)).toEqual(["quotations:update", "quotations:view"])
  })

  it("keeps grants with no :own form as-is on an own key", () => {
    const next = setKeyScope(
      new Set(),
      key("reports:quotations:view"),
      "own",
      ownable
    )
    expect(sorted(next)).toEqual(["quotations:read:own", "reports:module"])
    expect(keyScope(next, key("reports:quotations:view"))).toBe("own")
  })

  it("doesn't narrow a grant another key needs at any", () => {
    const viewAny = enableKeys(new Set(), [key("quotations:view")])
    const next = setKeyScope(viewAny, key("quotations:edit"), "own", ownable)
    expect(next.has("quotations:view")).toBe(true)
    expect(next.has("quotations:update:own")).toBe(true)
    expect(keyScope(next, key("quotations:edit"))).toBe("own")
    expect(keyScope(next, key("quotations:view"))).toBe("any")
  })

  it("narrows a shared grant to :own when only an own key still needs it", () => {
    // edit is own (update:own) but shares view, held as-is for the view key
    const viewAny = enableKeys(new Set(), [key("quotations:view")])
    const both = setKeyScope(viewAny, key("quotations:edit"), "own", ownable)
    const next = disableKeys(both, [key("quotations:view")], ownable)
    expect(sorted(next)).toEqual([
      "quotations:update:own",
      "quotations:view:own",
    ])
    expect(keyScope(next, key("quotations:edit"))).toBe("own")
    expect(keyScope(next, key("quotations:view"))).toBe("none")
  })

  it("can't narrow a key to own while any keys hold all its ownable grants", () => {
    // view = view + read: edit (any) needs view, the quotations report (any) needs read
    const set = enableKeys(new Set(), [
      key("quotations:edit"),
      key("reports:quotations:view"),
      key("quotations:view"),
    ])
    expect(canSetKeyScope(set, key("quotations:view"), "own", ownable)).toBe(
      false
    )
    expect(canSetKeyScope(set, key("quotations:edit"), "own", ownable)).toBe(
      true
    )
  })

  it("narrows View to own with the quotations module on", () => {
    // The module key used to grant quotations:read too, which kept it as-is
    // (every quotation) while View showed Own
    const moduleOn = enableKeys(new Set(), [key("quotations:module")])
    const next = setKeyScope(moduleOn, key("quotations:view"), "own", ownable)
    expect(sorted(next)).toEqual([
      "quotations:module",
      "quotations:read:own",
      "quotations:view:own",
    ])
    expect(next.has("quotations:read")).toBe(false)
  })

  it("counts own keys as on and reports scope changes", () => {
    const own = setKeyScope(new Set(), key("quotations:edit"), "own", ownable)
    const any = setKeyScope(own, key("quotations:edit"), "any", ownable)
    expect(countEnabledKeys(own)).toBe(countEnabledKeys(any))
    expect(changedKeys(any, own).map((k) => k.key)).toContain("quotations:edit")
  })
})

describe("module keys", () => {
  it("grant only *:module flags, never API permissions", () => {
    const moduleKeys = allPermissionKeys.filter((k) => k.key.endsWith(":module"))
    expect(moduleKeys.length).toBeGreaterThan(5)
    for (const k of moduleKeys) {
      expect(k.grants.every((g) => g.endsWith(":module")), k.key).toBe(true)
    }
  })
})
