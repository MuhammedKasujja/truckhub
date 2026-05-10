import * as apiClient from "@/lib/api-client"
import { redirect } from "@tanstack/react-router"
import { AuthResponse } from "@/features/auth/types"
import { LoginSchema } from "@/features/auth/schemas"
import { createServerFn } from "@tanstack/react-start"
import { createSession, deleteUserSession } from "@/lib/session"

export const login = createServerFn({ method: "POST" })
  .inputValidator((data) => LoginSchema.parse(data))
  .handler(async ({ data }) => {
    const response = await apiClient.postFn<AuthResponse>(`/v1/auth/login`, {
      ...data,
    })
    if (response.isSuccess) {
      await createSession({ ...response.data! })
    }
    return response
  })

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await deleteUserSession()
  throw redirect({ to: "/login", replace: true })
})
