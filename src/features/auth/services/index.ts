import { logger } from "@/lib/logger"
import { login, logout } from "./server"
import { LoginSchema } from "@/features/auth/schemas"
import { createServerFn } from "@tanstack/react-start"

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    return login(data)
  })

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  logger.info("+++++++++++++++ Logging out user +++++++++++++++++++++++++++++++++++++++=")
  return logout()
})
