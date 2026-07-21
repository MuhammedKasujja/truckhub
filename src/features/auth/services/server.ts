import * as apiClient from "@/lib/api-client"
import { AuthResponse, TokenResponse } from "@/features/auth/types"
import { ChangePasswordRequest, LoginSchemaType } from "@/features/auth/schemas"

const endpoint = "/v1/auth"

export async function login(data: LoginSchemaType) {
  const response = await apiClient.postFn<AuthResponse>(`${endpoint}/login`, {
    ...data,
  })
  return response
}

export async function logout() {
  // TODO: trigger backend logout
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

export async function changePassword(data: ChangePasswordRequest) {
  const response = await apiClient.postFn<TokenResponse>(
    `${endpoint}/password/change`,
    data
  )
  return response
}
