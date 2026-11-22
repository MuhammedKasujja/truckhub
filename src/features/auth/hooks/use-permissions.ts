import { useCallback } from "react"
import type { UserPermission } from "../permissions"
import type { OwnedResource } from "@/lib/permissions"
import { checkResourcePermission, checkUserPermission } from "@/lib/permissions"
import { useAuth } from "@/components/providers/auth-context"

export function usePermissions() {
  const { user } = useAuth()

  /** Feature level: true for "any" or "own" access */
  const hasPermission = useCallback(
    (permission: UserPermission): boolean => {
      if (!user?.permissions) return false
      const func = checkUserPermission(user)
      return func(permission)
    },
    [user]
  )

  /** Record level: can the user do this to `resource`? */
  const canOn = useCallback(
    (permission: UserPermission, resource: OwnedResource): boolean => {
      if (!user?.permissions) return false
      return checkResourcePermission(user)(permission, resource)
    },
    [user]
  )

  return { hasPermission, canOn }
}
