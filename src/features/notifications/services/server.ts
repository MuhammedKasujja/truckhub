import { EntityId } from "@/schemas"
import { NotificationItem } from "../types"
import * as apiClient from "@/lib/api-client"

export function getNotifications(userId: EntityId, unreadOnly?: boolean) {
  return apiClient.getFn<NotificationItem[]>(
    `/users/${userId}/notifications?unread_only=${unreadOnly ?? false}`
  )
}

export function markNotificationRead(
  userId: EntityId,
  notificationId: EntityId
) {
  return apiClient.postFn<NotificationItem>(
    `/users/${userId}/notifications/${notificationId}/read`,
    {}
  )
}

export async function markAllNotificationsRead(userId: EntityId) {
  return await apiClient.postFn<NotificationItem[]>(
    `/users/${userId}/notifications/read-all`,
    {}
  )
}

/**
 * Exchanges the session's long-lived access token for a short-lived (30s),
 * single-use WebSocket ticket. This is the only piece of "auth" that ever
 * reaches the browser, and it's worthless a few seconds after issue or
 * immediately after the socket connects — whichever comes first.
 */

export async function websocketConnect() {
  return await apiClient.postFn<{ ticket: string; expires_in: number }>(
    "/auth/ws-ticket",
    {}
  )
}
