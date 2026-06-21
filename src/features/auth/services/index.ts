import { logger } from "@/lib/logger"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { changePassword, login, logout, refreshAuthToken } from "./server"
import { createSession, getAccessToken, useAppSession } from "@/lib/session"
import {
  LoginSchema,
  RefreshTokenSchema,
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
  return getAccessToken()
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
