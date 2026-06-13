import { logger } from "@/lib/logger"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { login, logout, refreshAuthToken } from "./server"
import { LoginSchema, RefreshTokenSchema } from "@/features/auth/schemas"
import { createSession, getAccessToken, useAppSession } from "@/lib/session"

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
  logger.info(
    "+++++++++++++++ Logging out user +++++++++++++++++++++++++++++++++++++++="
  )
  const session = await useAppSession()
  await session.clear()
  await logout()
  // throw redirect({ to: "/login", replace: true })
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
