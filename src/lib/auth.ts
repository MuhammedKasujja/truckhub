import { getCurrentUser } from "@/lib/session"
import { redirect } from "@tanstack/react-router"
import { hasPermission } from "@/lib/permissions"
import type { UserPermission } from "@/features/auth/permissions"

export async function requirePermission(permission: UserPermission) {
  const user = await getCurrentUser()
  if (!user) throw redirect({ to: "/login", replace: true })

  const func = hasPermission(user)
  if (!func(permission)) {
    redirect("/unauthorized")
  }
}
