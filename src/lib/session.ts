import { cache } from "react"
import { SignJWT, jwtVerify } from "jose"
import { systemDateTime } from "@/lib/utils"
import { redirect } from "@tanstack/react-router"
import { getIronSession } from "iron-session"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import { UserSession, AuthResponse } from "@/features/auth/types"

const secretKey = process.env.JWT_SECRET
const encodedSecret = new TextEncoder().encode(secretKey)
const AUTH_ALGORITHM = "HS256"
const SESSION_KEY = "x-user-session"
// Matches the refresh token lifetime. Each save (login, token refresh) renews it.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

/**
 * Encrypted cookie session for the current request.
 *
 * TanStack Start removed its built-in `useSession` in 1.169, so this wraps
 * iron-session but keeps the old `{ data, update, clear }` shape for callers.
 * Call it once per operation; never keep the result in module scope.
 */
export async function useAppSession() {
  const password = process.env.SESSION_SECRET
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters")
  }

  const session = await getIronSession<Partial<UserSession>>(
    { read: getCookie, write: setCookie },
    {
      cookieName: SESSION_KEY,
      password,
      ttl: SESSION_TTL_SECONDS,
      cookieOptions: {
        // HTTPS only in production. The desktop app serves over plain
        // http://127.0.0.1, where WebKit would drop a Secure cookie.
        secure:
          process.env.NODE_ENV === "production" &&
          !process.env.TRUCKHUB_DESKTOP,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
      },
    }
  )

  return {
    /** Plain copy of the stored fields; empty when signed out. */
    get data() {
      return { ...session } as UserSession
    },
    /** Merge fields into the session and write the cookie. */
    async update(patch: Partial<UserSession>) {
      Object.assign(session, patch)
      await session.save()
    },
    /** Sign out: drop the data and expire the cookie. */
    clear() {
      session.destroy()
      return Promise.resolve()
    },
  }
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
    accessTokenExpiresAtMs: Date.now() + payload.expires_in * 1_000,
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

  if (!session?.accessToken) {
    throw redirect({ to: "/login", replace: true })
  }

  return {
    access_token: session.accessToken,
    user: session.user,
  }
})

export async function getAuthSession() {
  const session = await useAppSession()
  return !session
    ? undefined
    : {
        accessToken: session.data.accessToken,
        refreshToken: session.data.refreshToken,
        user: session.data.user,
      }
}

export function isExpiringSoon(
  expiresAt: number | undefined,
  bufferMs = 60_000
): boolean {
  if (!expiresAt) return false
  return Date.now() > expiresAt - bufferMs
}
