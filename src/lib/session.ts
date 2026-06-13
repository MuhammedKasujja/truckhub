import { cache } from "react"
import { SignJWT, jwtVerify } from "jose"
import { systemDateTime } from "@/lib/utils"
import { redirect } from "@tanstack/react-router"
import { useSession } from "@tanstack/react-start/server"
import { UserSession, AuthResponse } from "@/features/auth/types"

const secretKey = process.env.JWT_SECRET
const encodedSecret = new TextEncoder().encode(secretKey)
const AUTH_ALGORITHM = "HS256"
const SESSION_KEY = "x-user-session"

export function useAppSession() {
  return useSession<UserSession>({
    name: SESSION_KEY,
    password: process.env.SESSION_SECRET ?? "MUST_PROVIDE_SECRET_KEY",
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",
      httpOnly: true,
    },
  })
}

export async function createSessionToken(payload: UserSession) {
  const sessionDuration = systemDateTime
    .plus({ milliseconds: payload.accessTokenExpiresAtMs })
    .toJSDate()

  return new SignJWT({
    sub: `${payload.user.id}`,
    ...payload,
  })
    .setProtectedHeader({ alg: AUTH_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(sessionDuration)
    .sign(encodedSecret)
}

export async function verifySessionToken(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedSecret, {
      algorithms: [AUTH_ALGORITHM],
    })
    return payload as unknown as UserSession
  } catch (error) {
    console.log(`Failed to verify session ${error?.toString()}`)
    return null
  }
}

export async function createSession(payload: AuthResponse) {
  const userSessionData: UserSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessTokenExpiresAtMs: Date.now() * payload.expires_in * 1_000,
    user: {
      ...payload.user,
      permissions: payload.permissions,
    },
  }

  const session = await useAppSession()

  const sessionDuration = systemDateTime
    .plus({ milliseconds: userSessionData.accessTokenExpiresAtMs })
    .toJSDate()

  await session.update(userSessionData)
}

/**
 * Verify user login auth token
 */
export const verifySession = cache(async () => {
  const session = await getAuthSession()

  if (!session?.access_token) {
    throw redirect({ to: "/login", replace: true })
  }

  return {
    access_token: session.access_token,
    user: session.user,
  }
})

export async function getAuthSession() {
  const session = await useAppSession()
  return !session
    ? undefined
    : {
        access_token: session.data.accessToken,
        user: session.data.user,
      }
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = await useAppSession()
  return session.data.accessToken
}

export function isExpiringSoon(
  expiresAt: number | undefined,
  bufferMs = 60_000
): boolean {
  if (!expiresAt) return false
  return Date.now() > expiresAt - bufferMs
}
