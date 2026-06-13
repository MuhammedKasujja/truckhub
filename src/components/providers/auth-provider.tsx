"use client"

import { checkUserPermission } from "@/lib/permissions"
import { useEffect, useRef, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"

export function AuthProvider({ children }: { children: ReactNode }) {

  const { user, refresh, isLoading, handleSessionExpired } = useAuthSession()

  const hasPermission = user ? checkUserPermission(user) : undefined

  // ── Idle-tab detection ────────────────────────────────────────────────────
  // If we previously had a user and the poll now returns null, the refresh
  // token died server-side (expired naturally or revoked elsewhere).
  const hadUser = useRef(false)

  useEffect(() => {
    if (user) {
      hadUser.current = true
      return
    }
    if (!isLoading && user === null && hadUser.current) {
      handleSessionExpired()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading])

  return (
    <AuthContext.Provider
      value={{
        user: user,
        hasPermission,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
