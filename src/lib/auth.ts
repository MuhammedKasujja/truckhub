import { getCurrentUser } from "@/lib/session"
import { redirect } from "@tanstack/react-router"
import type { UserPermission } from "@/features/auth/permissions"
import { hasPermission as permissionHandler } from "@/lib/permissions"

export async function requirePermission(permission: UserPermission) {
  const user = await getCurrentUser()
  if (!user) throw redirect({ to: "/login", replace: true })

  const func = permissionHandler(user)
  if (!func(permission)) {
    throw redirect({ to: "/unauthorized" })
  }
}

export async function hasPermission(permission: UserPermission) {
  return await requirePermission(permission)
}