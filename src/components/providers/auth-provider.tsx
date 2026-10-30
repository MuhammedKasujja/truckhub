import { checkUserPermission } from "@/lib/permissions"
import { useCallback, useMemo, useState, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import { SessionIdleWarningDialog } from "../session-warning-dialog"
import { IDLE_PROMPT_MS, IDLE_TIMEOUT_MS } from "@/common/constants"
import { logger } from "@/lib/logger"
import { UserPermission } from "@/features/auth/permissions"

// Derived, so the dialog's displayed countdown can never drift from the real timeout
const COUNTDOWN_SECONDS = Math.round((IDLE_TIMEOUT_MS - IDLE_PROMPT_MS) / 1000)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, refresh, logout } = useAuthSession()

  // ── Idle timeout: show a warning before auto-logout, regardless of
  // token validity. Only runs while authenticated.
  const [showIdleWarning, setShowIdleWarning] = useState(false)

  const handlePrompt = useCallback(() => setShowIdleWarning(true), [])
  const handleActive = useCallback(() => setShowIdleWarning(false), [])
  const handleIdle = useCallback(() => {
    logger.info("Idle timeout reached, logging out")
    setShowIdleWarning(false)
    logout()
  }, [logout])

  const { stayActive } = useIdleTimer({
    promptTimeout: IDLE_PROMPT_MS,
    timeout: IDLE_TIMEOUT_MS,
    enabled: !!user,
    onPrompt: handlePrompt, // show the warning dialog
    onActive: handleActive, // hide the dialog after "stay logged in"
    onIdle: handleIdle, // time is up: log out
  })

  // stayActive() already calls onActive, which hides the dialog
  const handleStayLoggedIn = stayActive

  const handleLogoutNow = useCallback(() => {
    logger.info("Manual logout from idle warning")
    setShowIdleWarning(false)
    logout()
  }, [logout])

  const hasPermission = useCallback(
    (permission: UserPermission): boolean => {
      if (!user?.permissions) return false
      const func = checkUserPermission(user)
      return func(permission)
    },
    [user]
  )

  // Stable reference: consumers don't re-render when only showIdleWarning changes
  const value = useMemo(
    () => ({ user, hasPermission, refresh }),
    [user, hasPermission, refresh]
  )

  return (
    <AuthContext.Provider value={value}>
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
