import type { NotificationItem } from "../types"
import type { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "v1/notifications"

type ListInput = { page: number; perPage: number; unreadOnly: boolean }

/** The logged-in user's notifications, newest first. */
export async function getNotifications(input: ListInput) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<NotificationItem[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export function getUnreadNotificationCount() {
  return apiClient.getFn<{ count: number }>(`${endpoint}/unread-count`)
}

/** `id` is the recipient row id, the `id` of a listed or pushed notification. */
export function markNotificationRead(id: EntityId) {
  return apiClient.postFn<null>(`${endpoint}/${id}/read`, {})
}

export function markAllNotificationsRead() {
  return apiClient.postFn<null>(`${endpoint}/read-all`, {})
}

/**
 * Exchanges the session's long-lived access token for a short-lived (30s),
 * single-use WebSocket ticket. This is the only piece of "auth" that ever
 * reaches the browser, and it's worthless a few seconds after issue or
 * immediately after the socket connects — whichever comes first.
 */
export async function websocketConnect() {
  return await apiClient.postFn<{ ticket: string; expires_in: number }>(
    "v1/auth/ws-ticket",
    {}
  )
}
