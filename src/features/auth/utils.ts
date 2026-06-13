import { getCurrentUser } from "@/lib/auth"
import { checkUserPermission } from "@/lib/permissions"
import { sibebarModules } from "@/components/app-sidebar"

export async function checkUserModuleAccess() {
  const user = await getCurrentUser()
  if (!user) return { redirect: "/login", replace: true } as const

  const hasPermission = checkUserPermission(user)
  const firstModuleAccess = sibebarModules.find((module) =>
    hasPermission(module.permission)
  )
  if (firstModuleAccess) {
    return { redirect: firstModuleAccess.url, replace: true } as const
  }

  return { redirect: "/unauthorized-module", replace: true } as const
}
