import type { User } from "@/features/auth/types"
import type { UserPermission } from "@/features/auth/permissions"
import { KeyNamedPermissions } from "@/features/auth/permissions"

/**
 * How far a permission reaches. The backend grants each ownable API
 * permission in two forms: `quotations:view` (any record in the company)
 * and `quotations:view:own` (only records the user created).
 */
export type PermissionScope = "any" | "own"

/** A record that carries ownership info from the API. */
export type OwnedResource = {
  created_by?: string | null
  /** Server-computed answers keyed by API permission, e.g. `{ "quotations:update": true }` */
  can?: Record<string, boolean>
}

export const OWN_SUFFIX = ":own"

/**
 * The scope a set of held API permissions gives over `grants`:
 * `"any"` when every grant is held as-is, `"own"` when each one is held
 * either as-is or as its `:own` form, `null` otherwise.
 *
 * No grants at all (e.g. `"me:view": []`) means open to every signed-in
 * user, so `"any"`.
 *
 * Shared by the route guards (a user's permissions) and the role editor
 * (a role's permissions), so both read scopes the same way.
 */
export function scopeOfGrants(
  held: ReadonlySet<string>,
  grants: readonly string[]
): PermissionScope | null {
  if (grants.every((p) => held.has(p))) return "any"
  if (grants.every((p) => held.has(p) || held.has(`${p}${OWN_SUFFIX}`)))
    return "own"
  return null
}

/**
 * `"any"` when the user holds every API permission the key grants,
 * `"own"` when each one is held either as-is or as its `:own` form,
 * `null` when the user can't use the feature at all.
 */
export function getPermissionScope(
  user: User,
  permission: UserPermission
): PermissionScope | null {
  if (user.is_admin) return "any"

  // Lookup the named permissions with the backend corresponding permission names
  const required: readonly string[] = KeyNamedPermissions[permission]

  // using set for 0(1) lookups
  return scopeOfGrants(new Set(user.permissions), required)
}

/** Page / menu level: can the user use this feature at all (any or own)? */
export function checkUserPermission(user: User) {
  return (permission: UserPermission) =>
    getPermissionScope(user, permission) !== null
}

/**
 * Record level: can the user do this to *this* record? Prefers the
 * server's `can` flags and falls back to comparing `created_by`.
 */
export function checkResourcePermission(user: User) {
  return (permission: UserPermission, resource: OwnedResource) => {
    if (user.is_admin) return true

    // No grants (e.g. "me:view") means open to every signed-in user: `every` is true
    const required: readonly string[] = KeyNamedPermissions[permission]

    const userPermSet = new Set(user.permissions)
    const isOwner =
      resource.created_by != null && resource.created_by === user.id

    return required.every(
      (p) =>
        resource.can?.[p] ??
        (userPermSet.has(p) || (isOwner && userPermSet.has(`${p}:own`)))
    )
  }
}
