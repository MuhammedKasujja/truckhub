import { SystemPermissions } from "@/features/auth/permissions"

/**
 * The UI works with named permissions ("users:edit"), each of which grants
 * one or more API permissions ("users:update"). A role stores API
 * permissions only, so a named permission counts as on when the role has
 * every API permission it grants.
 */

export type PermissionKey = {
  key: string
  module: string
  grants: readonly string[]
}

export type PermissionModule = {
  module: string
  keys: PermissionKey[]
}

export const permissionModules: PermissionModule[] = Object.entries(
  SystemPermissions
).map(([module, groups]) => ({
  module,
  keys: Object.entries(groups).map(([key, grants]) => ({
    key,
    module,
    grants: grants as readonly string[],
  })),
}))

export const allPermissionKeys = permissionModules.flatMap((m) => m.keys)

export function isKeyOn(selected: ReadonlySet<string>, key: PermissionKey) {
  return key.grants.length > 0 && key.grants.every((g) => selected.has(g))
}

/**
 * Other enabled keys that already grant everything `key` grants. While one
 * of them is on, `key` can't be switched off on its own.
 */
export function keysIncluding(
  selected: ReadonlySet<string>,
  key: PermissionKey
) {
  return allPermissionKeys.filter(
    (other) =>
      other.key !== key.key &&
      isKeyOn(selected, other) &&
      key.grants.every((g) => other.grants.includes(g))
  )
}

/** Adds every API permission the keys grant. */
export function enableKeys(
  selected: ReadonlySet<string>,
  keys: PermissionKey[]
) {
  const next = new Set(selected)
  keys.forEach((k) => k.grants.forEach((g) => next.add(g)))
  return next
}

/**
 * Removes the keys' API permissions, except those still needed by another
 * enabled key. API permissions no key knows about are left alone.
 */
export function disableKeys(
  selected: ReadonlySet<string>,
  keys: PermissionKey[]
) {
  const removing = new Set(keys.map((k) => k.key))
  const stillNeeded = new Set(
    allPermissionKeys
      .filter((k) => !removing.has(k.key) && isKeyOn(selected, k))
      .flatMap((k) => k.grants)
  )
  const next = new Set(selected)
  keys.forEach((k) =>
    k.grants.forEach((g) => {
      if (!stillNeeded.has(g)) next.delete(g)
    })
  )
  return next
}

/** Named permissions whose on/off state differs between two sets. */
export function changedKeys(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  return allPermissionKeys.filter((k) => isKeyOn(a, k) !== isKeyOn(b, k))
}

export function countEnabledKeys(selected: ReadonlySet<string>) {
  return allPermissionKeys.filter((k) => isKeyOn(selected, k)).length
}

/** Modules where the role has at least one named permission. */
export function modulesWithAccess(selected: ReadonlySet<string>) {
  return permissionModules.filter((m) =>
    m.keys.some((k) => isKeyOn(selected, k))
  )
}
