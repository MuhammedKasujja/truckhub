import { logger } from "@/lib/logger"
import { isRedirect, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { checkUserPermission } from "@/lib/permissions"
import { isExpiringSoon, useAppSession } from "./session"
import { refreshAuthTokenFn } from "@/features/auth/services"
import type { UserPermission } from "@/features/auth/permissions"

export async function requirePermission(permission: UserPermission) {
  const user = await requireAuth({ redirectTo: "/login" })

  const func = checkUserPermission(user)
  if (!func(permission)) {
    throw redirect({ to: "/unauthorized" })
  }
}

export async function requireAuth({
  redirectTo = "/login",
}: { redirectTo?: string } = {}) {
  let user: Awaited<ReturnType<typeof getCurrentUser>>
  try {
    user = await getCurrentUser()
  } catch (error) {
    if (isRedirect(error)) throw error
    // Server fn transport/serialization failure — treat as signed out
    // instead of letting a bare object reach the route error boundary.
    console.error("getCurrentUser failed", error)
    throw redirect({ to: redirectTo })
  }
  if (!user) throw redirect({ to: redirectTo })
  return user
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()

    try {
      const data = session.data

      if (!data.refreshToken || !data.user) return null

      if (data.accessToken && !isExpiringSoon(data.accessTokenExpiresAtMs)) {
        return data.user
      }
      // Refresh Auth token it about to expire
      logger.info("Refreshing User auth token")
      const { error, data: token } = await refreshAuthTokenFn({
        data: { refreshToken: data.refreshToken },
      })

      if (error || !token) {
        logger.error(`Refreshing auth token failed ${error}`)
        await session.clear()
        return null
      }
      logger.info(`Token Refresh Done`)
      await session.update({
        ...data,
        accessTokenExpiresAtMs: Date.now() + token.expires_in * 1_000, // Convert in millseconds
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
      })
      return data.user
    } catch (error) {
      logger.error(`getCurrentUser failed: ${String(error)}`)
      await session.clear().catch(() => {})
      return null
    }
  }
)
