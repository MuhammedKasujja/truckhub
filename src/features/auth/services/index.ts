import { logger } from "@/lib/logger"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { createSession, useAppSession } from "@/lib/session"
import { changePassword, login, logout, refreshAuthToken } from "./server"
import {
  LoginSchema,
  RefreshTokenSchema,
  TokenResponseSchema,
  ChangePasswordSchema,
} from "@/features/auth/schemas"

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    const response = await login(data)

    if (response.isSuccess) {
      await createSession({ ...response.data! })
    }
    return response
  })

export const logoutFn = createServerFn().handler(async () => {
  logger.info("Logging out user +++++++++++++++++++++++++++++++++++++++=")
  const session = await useAppSession()
  await session.clear()
  // avoid await so the user logout is instant
  logout()
  throw redirect({ to: "/login", replace: true })
})

export const getAccessTokenFn = createServerFn().handler(async () => {
  const session = await useAppSession()
  return session.data.accessToken
})

export const getSession = createServerFn().handler(async () => {
  const session = await useAppSession()
  return session.data
})

export const clearSession = createServerFn().handler(async () => {
  const session = await useAppSession()
  session.clear()
})

export const updateSession = createServerFn()
  .inputValidator(TokenResponseSchema)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const updated = {
      user: session.data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpiresAtMs: Date.now() + data.expires_in * 1_000,
    }
    await session.update(updated)
  })

export const refreshAuthTokenFn = createServerFn({ method: "POST" })
  .inputValidator(RefreshTokenSchema)
  .handler(async ({ data }) => {
    const response = await refreshAuthToken(data.refreshToken)
    return response
  })

export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator(ChangePasswordSchema)
  .handler(async ({ data }) => {
    const response = await changePassword(data)
    return response
  })
