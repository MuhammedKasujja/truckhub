import { login } from "./server"
import { logger } from "@/lib/logger"
import { LoginSchema } from "@/features/auth/schemas"
import { createServerFn } from "@tanstack/react-start"
import { deleteUserSession, getAccessToken } from "@/lib/session"

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    return login(data)
  })

export const logoutFn = createServerFn().handler(async () => {
  logger.info("+++++++++++++++ Logging out user +++++++++++++++++++++++++++++++++++++++=")
  await deleteUserSession()
})

export const getAccessTokenFn = createServerFn().handler( async ()=>{
  return getAccessToken()
})
