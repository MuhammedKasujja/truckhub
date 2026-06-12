import * as apiClient from "@/lib/api-client"
import { redirect } from "@tanstack/react-router"
import { deleteUserSession } from "@/lib/session"
import { LoginSchemaType } from "@/features/auth/schemas"
import { AuthResponse, TokenResponse } from "@/features/auth/types"

const endpoint = "/v1/auth"

export async function login(data: LoginSchemaType) {
  const response = await apiClient.postFn<AuthResponse>(`${endpoint}/login`, {
    ...data,
  })
  return response
}

export async function logout() {
  await deleteUserSession()
  throw redirect({ to: "/login", replace: true })
}

export async function refreshAuthToken(refreshToken: string) {
  const response = await apiClient.postFn<TokenResponse>(
    `${endpoint}/refresh`,
    {
      refresh_token: refreshToken,
    }
  )
  return response
}
