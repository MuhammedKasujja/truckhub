import { logger } from "@/lib/logger"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { checkUserPermission } from "@/lib/permissions"
import { isExpiringSoon, useAppSession } from "./session"
import { refreshAuthTokenFn } from "@/features/auth/services"
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

    const data = session.data

    if (!data.refreshToken) return null

    if (data.accessToken && !isExpiringSoon(data.accessTokenExpiresAtMs)) {
      return data.user
    }
    // Refresh Auth token it about to expire
    logger.info("Refreshing User auth token")
    const { error, data: token, message } = await refreshAuthTokenFn({
      data: { refreshToken: data.refreshToken! },
    })
    logger.error(`Refreshing User auth token ${message}`)
    if (error || !token) {
      await session.clear()
      return null
    }

    await session.update({
      ...data,
      accessTokenExpiresAtMs: Date.now() * token.expires_in * 1_000, // Convert in millseconds
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
    })
    return data.user
  }
)
