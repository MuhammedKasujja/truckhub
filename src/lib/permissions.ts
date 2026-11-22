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
  if (required.length === 0) return null

  // using set for 0(1) lookups
  const userPermSet = new Set(user.permissions)

  if (required.every((p) => userPermSet.has(p))) return "any"
  if (required.every((p) => userPermSet.has(p) || userPermSet.has(`${p}:own`)))
    return "own"
  return null
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

    const required: readonly string[] = KeyNamedPermissions[permission]
    if (required.length === 0) return false

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
