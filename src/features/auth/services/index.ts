import { logger } from "@/lib/logger"
import { login, refreshAuthToken } from "./server"
import { createServerFn } from "@tanstack/react-start"
import { LoginSchema, RefreshTokenSchema } from "@/features/auth/schemas"
import { createSession, deleteUserSession, getAccessToken } from "@/lib/session"

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
  await deleteUserSession()
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
