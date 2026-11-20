import {  createContext, useContext } from "react"
import type {ReactNode} from "react";
import { useAuth } from "@/components/providers/auth-context"
import { useNotifications } from "@/features/notifications/hooks/use-notifications"

type NotificationsContextValue = ReturnType<typeof useNotifications>

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

/**
 * Mounted ONCE, inside AuthProvider in the admin layout. Every descendant reads
 * the shared result via useNotificationsContext() instead of calling
 * useNotifications directly — that's what keeps the app at exactly one
 * WebSocket connection no matter how many components (bell icon,
 * notifications page, ...) need the data.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const value = useNotifications(user?.id)
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error(
      "useNotificationsContext must be used within a <NotificationsProvider>"
    )
  }
  return ctx
}
