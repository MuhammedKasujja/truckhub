import { logger } from "@/lib/logger"
import { createServerFn } from "@tanstack/react-start"
import { checkResourcePermission, getPermissionScope } from "@/lib/permissions"
import type { OwnedResource, PermissionCheck } from "@/lib/permissions"
import { isExpiringSoon, useAppSession } from "./session"
import { isRedirect, redirect } from "@tanstack/react-router"
import { isRefreshRejected, refreshTokens } from "@/lib/api"
import type { User } from "@/features/auth/types"
import type { UserPermission } from "@/features/auth/permissions"

/**
 * Route guard for `beforeLoad`. Lets the user in when they hold the
 * permission for any record or only their own, and returns the scope so
 * it lands on the route context (`Route.useRouteContext().permissionScope`).
 *
 * It runs before the record is fetched, so for routes about one record,
 * also call `requireResourcePermission` in the loader.
 */
export async function requirePermission(permission: PermissionCheck) {
  const user = await requireAuth({ redirectTo: "/login" })

  const permissionScope = getPermissionScope(user, permission)
  if (!permissionScope) {
    throw redirect({ to: "/unauthorized" })
  }
  return { permissionScope }
}

/**
 * Record-level guard for loaders, after the record is fetched. Stops a user
 * whose permission only covers their own records from opening someone
 * else's, e.g. `quotations:view` (any) + `quotations:update:own` on the edit
 * page. Pass `context.user` from the `_admin` route.
 */
export function requireResourcePermission(
  user: User,
  permission: UserPermission,
  resource: OwnedResource
) {
  if (!checkResourcePermission(user)(permission, resource)) {
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
      // Refresh the access token when it is about to expire
      logger.info("Refreshing User auth token")
      let token: Awaited<ReturnType<typeof refreshTokens>>
      try {
        token = await refreshTokens(data.refreshToken)
      } catch (error) {
        logger.error(`Refreshing auth token failed ${String(error)}`)
        if (isRefreshRejected(error)) {
          await session.clear()
          return null
        }
        // Timeout or backend blip: stay signed in. The next API call retries
        // the refresh through the axios interceptor.
        return data.user
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
