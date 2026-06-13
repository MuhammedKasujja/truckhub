"use client"

const IDLE_TIMEOUT_MS = 2 * 60 * 1000 // total idle time before logout [ 15 min]
const IDLE_PROMPT_MS = 1 * 60 * 1000 // show warning 1 min before logout
const COUNTDOWN_SECONDS = (IDLE_TIMEOUT_MS - IDLE_PROMPT_MS) / 1000

import { checkUserPermission } from "@/lib/permissions"
import { useState, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import { SessionIdleWarningDialog } from "../session-warning-dialog"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, refresh, logout } = useAuthSession()

  // ── Idle timeout: show a warning before auto-logout, regardless of
  // token validity. Only runs while authenticated.
  const [showIdleWarning, setShowIdleWarning] = useState(false)

  const { stayActive } = useIdleTimer({
    promptTimeout: IDLE_PROMPT_MS,
    timeout: IDLE_TIMEOUT_MS,
    enabled: !!user,
    onPrompt: () => setShowIdleWarning(true),
    onActive: () => setShowIdleWarning(false),
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
    setShowIdleWarning(false)
    logout()
  }

  const hasPermission = user ? checkUserPermission(user) : undefined

  return (
    <AuthContext.Provider
      value={{
        user: user,
        hasPermission,
        refresh,
      }}
    >
      {children}
      <SessionIdleWarningDialog
        open={showIdleWarning}
        countdownSeconds={COUNTDOWN_SECONDS}
        onStayLoggedIn={handleStayLoggedIn}
        onLogoutNow={handleLogoutNow}
      />
    </AuthContext.Provider>
  )
}
