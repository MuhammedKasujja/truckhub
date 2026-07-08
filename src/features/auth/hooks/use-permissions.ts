import { useCallback } from "react"
import { UserPermission } from "../permissions"
import { checkUserPermission } from "@/lib/permissions"
import { useAuth } from "@/components/providers/auth-context"

export function usePermissions() {
  const { user } = useAuth()
  const hasPermission = useCallback(
    (permission: UserPermission): boolean => {
      if (!user?.permissions) return false
      const func = checkUserPermission(user)
      return func(permission)
    },
    [user]
  )

  return { hasPermission }
}
