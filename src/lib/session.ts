import { cache } from "react"
import { SignJWT, jwtVerify } from "jose"
import { systemDateTime } from "@/lib/utils"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
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
    .plus({ minutes: payload.expires_in })
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
    access_token: payload.access_token,
    expires_in: payload.expires_in,
    user: {
      ...payload.user,
      permissions: payload.permissions,
    },
  }

  const session = await useAppSession()

  const sessionDuration = systemDateTime
    .plus({ minutes: userSessionData.expires_in })
    .toJSDate()

  await session.update(userSessionData)
}

export async function deleteUserSession() {
  const session = await useAppSession()
  await session.clear()
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
        access_token: session.data.access_token,
        user: session.data.user,
      }
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = await useAppSession()
  return session.data.access_token
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()

    return session?.data.user
  }
)
