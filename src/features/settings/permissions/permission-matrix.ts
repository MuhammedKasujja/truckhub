import type { PermissionScope } from "@/lib/permissions"
import { SystemPermissions } from "@/features/auth/permissions"
import { OWN_SUFFIX, scopeOfGrants } from "@/lib/permissions"

/**
 * The UI works with named permissions ("users:edit"), each of which grants
 * one or more API permissions ("users:update"). A role stores API
 * permissions only, so a named permission counts as on when the role has
 * every API permission it grants.
 *
 * Some API permissions are "ownable": the backend also has `<name>:own`,
 * which covers only records the user created (`<name>` covers every record
 * in the company). A named permission with an ownable grant can then be set
 * to None / Own / Any instead of off / on. Which names are ownable comes
 * from the backend permission list (`ownableFrom`).
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

export type KeyScope = "none" | PermissionScope

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

const NO_OWNABLE: ReadonlySet<string> = new Set()

const ownForm = (grant: string) => `${grant}${OWN_SUFFIX}`

/** API permissions that can be granted for own records only, from the backend list. */
export function ownableFrom(permissionNames: readonly string[]) {
  return new Set(
    permissionNames
      .filter((name) => name.endsWith(OWN_SUFFIX))
      .map((name) => name.slice(0, -OWN_SUFFIX.length))
  )
}

/** True when the key can be set to "own": at least one of its grants is ownable. */
export function isScopable(key: PermissionKey, ownable: ReadonlySet<string>) {
  return key.grants.some((g) => ownable.has(g))
}

export function keyScope(
  selected: ReadonlySet<string>,
  key: PermissionKey
): KeyScope {
  // A key with no grants is open to everyone, so a role can't turn it on or off
  if (key.grants.length === 0) return "none"
  return scopeOfGrants(selected, key.grants) ?? "none"
}

/** On at either scope. */
export function isKeyOn(selected: ReadonlySet<string>, key: PermissionKey) {
  return keyScope(selected, key) !== "none"
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

/**
 * Other keys at "any" scope sharing an ownable grant with `key`: they keep
 * that grant as-is, which can stop `key` being narrowed to "own".
 */
export function keysForcingAny(
  selected: ReadonlySet<string>,
  key: PermissionKey,
  ownable: ReadonlySet<string>
) {
  return allPermissionKeys.filter(
    (other) =>
      other.key !== key.key &&
      keyScope(selected, other) === "any" &&
      key.grants.some((g) => ownable.has(g) && other.grants.includes(g))
  )
}

/**
 * Whether choosing `scope` for `key` would actually leave it at that scope.
 * False when other keys hold it up: "none" while a broader key is on,
 * "own" while "any" keys keep its ownable grants as-is.
 */
export function canSetKeyScope(
  selected: ReadonlySet<string>,
  key: PermissionKey,
  scope: KeyScope,
  ownable: ReadonlySet<string>
) {
  return keyScope(setKeyScope(selected, key, scope, ownable), key) === scope
}

/**
 * Adds every API permission the keys grant, at "any" scope. Their `:own`
 * forms go: "any" already covers them.
 */
export function enableKeys(
  selected: ReadonlySet<string>,
  keys: PermissionKey[]
) {
  const next = new Set(selected)
  keys.forEach((k) =>
    k.grants.forEach((g) => {
      next.add(g)
      next.delete(ownForm(g))
    })
  )
  return next
}

/**
 * The lowest form of each API permission that enabled keys other than
 * `excluding` still need: "any" (as-is) or "own" (its `:own` form will do).
 */
function grantsStillNeeded(
  selected: ReadonlySet<string>,
  excluding: ReadonlySet<string>,
  ownable: ReadonlySet<string>
) {
  const needed = new Map<string, PermissionScope>()
  for (const other of allPermissionKeys) {
    if (excluding.has(other.key)) continue
    const scope = keyScope(selected, other)
    if (scope === "none") continue
    for (const g of other.grants) {
      // A non-ownable grant has no `:own` form, so an "own" key still needs it as-is
      const level = scope === "any" || !ownable.has(g) ? "any" : "own"
      if (needed.get(g) !== "any") needed.set(g, level)
    }
  }
  return needed
}

/**
 * Removes the keys' API permissions (both forms), except what another
 * enabled key still needs: kept as-is, or narrowed to its `:own` form when
 * that key is only at "own" scope. API permissions no key knows about are
 * left alone.
 */
export function disableKeys(
  selected: ReadonlySet<string>,
  keys: PermissionKey[],
  ownable: ReadonlySet<string> = NO_OWNABLE
) {
  const needed = grantsStillNeeded(
    selected,
    new Set(keys.map((k) => k.key)),
    ownable
  )
  const next = new Set(selected)
  keys.forEach((k) =>
    k.grants.forEach((g) => {
      const level = needed.get(g)
      if (level === "any") return
      if (level === "own") {
        if (next.delete(g)) next.add(ownForm(g))
        return
      }
      next.delete(g)
      next.delete(ownForm(g))
    })
  )
  return next
}

/**
 * Sets one key to None / Own / Any. "Own" uses the `:own` form of each
 * ownable grant, unless another key at "any" still needs it as-is; grants
 * with no `:own` form stay as-is (the key needs them to be on at all).
 */
export function setKeyScope(
  selected: ReadonlySet<string>,
  key: PermissionKey,
  scope: KeyScope,
  ownable: ReadonlySet<string>
) {
  if (scope === "none") return disableKeys(selected, [key], ownable)
  if (scope === "any") return enableKeys(selected, [key])

  const needed = grantsStillNeeded(selected, new Set([key.key]), ownable)
  const next = new Set(selected)
  key.grants.forEach((g) => {
    if (!ownable.has(g) || needed.get(g) === "any") {
      next.add(g)
      next.delete(ownForm(g))
      return
    }
    next.delete(g)
    next.add(ownForm(g))
  })
  return next
}

/** Named permissions whose scope differs between two sets. */
export function changedKeys(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  return allPermissionKeys.filter((k) => keyScope(a, k) !== keyScope(b, k))
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
