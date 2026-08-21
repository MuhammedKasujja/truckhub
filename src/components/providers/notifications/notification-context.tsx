import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { EntityId } from "@/schemas";
import { createContext, useContext, type ReactNode } from "react";

type NotificationsContextValue = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Mount this ONCE, near the root of the authenticated part of the app
 * (e.g. in your root layout route, alongside where you already know the
 * logged-in user's id). Every descendant reads the shared result via
 * useNotificationsContext() instead of calling useNotifications directly —
 * that's what keeps you at exactly one WebSocket connection no matter how
 * many components (bell icon, notifications page, toast listener, ...)
 * need the data.
 */
export function NotificationsProvider({
  userId,
  children,
}: {
  userId: EntityId | undefined;
  children: ReactNode;
}) {
  const value = useNotifications(userId);
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificationsContext must be used within a <NotificationsProvider>"
    );
  }
  return ctx;
}