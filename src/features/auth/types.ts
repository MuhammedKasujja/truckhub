import { EntityId } from "@/schemas"

export interface AuthUser {
  id: EntityId
  name: string
  email: string
  is_admin: boolean
  photo_url?: string
}

export interface User extends AuthUser {
  permissions: string[]
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  user: AuthUser
  permissions: string[]
}

export type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export type UserSession = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAtMs: number
  user: User
}
