import { cache } from "react";
import { cookies } from "next/headers";
import { systemDateTime } from "./utils";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "@tanstack/react-router";
import { UserSession, User, AuthResponse } from "@/features/auth/types";
const secretKey = process.env.JWT_SECRET;
const encodedSecret = new TextEncoder().encode(secretKey);
const AUTH_ALGORITHM = "HS256";
const SESSION_KEY = "session";

export async function encrypt(payload: UserSession) {
  const sessionDuration = systemDateTime
    .plus({ minutes: payload.expires_in })
    .toJSDate();

  return new SignJWT({
    sub: `${payload.user.id}`,
    ...payload,
  })
    .setProtectedHeader({ alg: AUTH_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(sessionDuration)
    .sign(encodedSecret);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedSecret, {
      algorithms: [AUTH_ALGORITHM],
    });
    return payload;
  } catch (error) {
    console.log(`Failed to verify session ${error?.toString()}`);
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
  };

  const session = await encrypt(userSessionData);

  const cookieStore = await cookies();

  const sessionDuration = systemDateTime
    .plus({ minutes: userSessionData.expires_in })
    .toJSDate();

  cookieStore.set(SESSION_KEY, session, {
    httpOnly: true,
    secure: true,
    expires: sessionDuration,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const session = (await cookies()).get(SESSION_KEY)?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = systemDateTime
    .plus({ minutes: Number(payload.expires_in) })
    .toJSDate();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

/**
 * Verify user login auth token `server-only`
 */
export const verifySession = cache(async () => {
  const session = await getAuthSession();

  if (!session?.access_token) {
    redirect("/login");
  }

  return {
    access_token: session.access_token,
    user: session.user,
  };
});

export async function getAuthSession() {
  const cookie = (await cookies()).get(SESSION_KEY)?.value;
  const session = await decrypt(cookie);
  return !session
    ? undefined
    : {
        access_token: session.access_token,
        user: session.user,
      };
}

export async function getAccessToken(): Promise<string> {
  const authData = await verifySession();
  return authData.access_token as string;
}

export async function getCurrentUser(): Promise<User | undefined> {
  const session = await getAuthSession();
  return session ? (session.user as User) : undefined;
}
