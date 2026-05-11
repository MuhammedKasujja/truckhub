import * as apiClient from "@/lib/api-client"
import { redirect } from "@tanstack/react-router"
import { AuthResponse } from "@/features/auth/types"
import { LoginSchemaType } from "@/features/auth/schemas"
import { createSession, deleteUserSession } from "@/lib/session"

export async function login(data: LoginSchemaType) {
  const response = await apiClient.postFn<AuthResponse>(`/v1/auth/login`, {
    ...data,
  })
  if (response.isSuccess) {
    await createSession({ ...response.data! })
  }
  return response
}

export async function logout() {
  await deleteUserSession()
  throw redirect({ to: "/login", replace: true })
}
