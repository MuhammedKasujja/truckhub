import { logger } from "@/lib/logger"
import { login, logout } from "./server"
import { getAccessToken } from "@/lib/session"
import { LoginSchema } from "@/features/auth/schemas"
import { createServerFn } from "@tanstack/react-start"

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    return login(data)
  })

export const logoutFn = createServerFn().handler(async () => {
  logger.info("+++++++++++++++ Logging out user +++++++++++++++++++++++++++++++++++++++=")
  return await logout()
})

export const getAccessTokenFn = createServerFn().handler( async ()=>{
  return getAccessToken()
})
