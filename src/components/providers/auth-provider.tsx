"use client"

import { checkUserPermission } from "@/lib/permissions"
import { useCallback, useState, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import { SessionIdleWarningDialog } from "../session-warning-dialog"
import {
  COUNTDOWN_SECONDS,
  IDLE_PROMPT_MS,
  IDLE_TIMEOUT_MS,
} from "@/common/constants"
import { logger } from "@/lib/logger"
import { UserPermission } from "@/features/auth/permissions"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, refresh, logout } = useAuthSession()

  // ── Idle timeout: show a warning before auto-logout, regardless of
  // token validity. Only runs while authenticated.
  const [showIdleWarning, setShowIdleWarning] = useState(false)

  const { stayActive } = useIdleTimer({
    promptTimeout: IDLE_PROMPT_MS,
    timeout: IDLE_TIMEOUT_MS,
    enabled: !!user,
    onPrompt: () => setShowIdleWarning(true), // when to show the warning
    onActive: () => setShowIdleWarning(false), // when to actually log out
    onIdle: () => {
      setShowIdleWarning(false)
      logout()
    },
  })

  function handleStayLoggedIn() {
    setShowIdleWarning(false)
    stayActive()
  }

  function handleLogoutNow() {
    logger.info("Logout automatic.... AuthProvider")
    setShowIdleWarning(false)
    logout()
  }

  const hasPermission = useCallback(
    (permission: UserPermission): boolean => {
      if (!user?.permissions) return false
      const func = checkUserPermission(user)
      return func(permission)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user: user,
        hasPermission,
        refresh,
      }}
    >
      {children}
      {/* Idle Session Warning Dialog */}
      <SessionIdleWarningDialog
        open={showIdleWarning}
        countdownSeconds={COUNTDOWN_SECONDS}
        onStayLoggedIn={handleStayLoggedIn}
        onLogoutNow={handleLogoutNow}
      />
    </AuthContext.Provider>
  )
}
