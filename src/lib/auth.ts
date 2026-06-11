import { useAppSession } from "./session"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { checkUserPermission } from "@/lib/permissions"
import type { UserPermission } from "@/features/auth/permissions"

async function requirePermission(permission: UserPermission) {
  const user = await getCurrentUser()
  if (!user) throw redirect({ to: "/login", replace: true })

  const func = checkUserPermission(user)
  if (!func(permission)) {
    throw redirect({ to: "/unauthorized" })
  }
}

export async function hasPermission(permission: UserPermission) {
  return await requirePermission(permission)
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()

    return session?.data.user
  }
)
