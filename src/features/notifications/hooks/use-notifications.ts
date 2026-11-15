import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  getUnreadNotificationCountFn,
  getWsTicketFn,
  listNotificationsFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "../services"
import { NOTIFICATIONS_PER_PAGE } from "../schemas"
import type { InfiniteData, QueryClient } from "@tanstack/react-query"
import type { EntityId } from "@/schemas"
import type { NotificationItem } from "../types"

const WEBSOCKET_CONECTION_RETRY_DELAY = 1000

// The browser connects directly to the API for the socket itself; only the
// token is kept off the client. VITE_BACKEND_URL is the public address of the
// API (the server-only BACKEND_URL is not exposed to the browser).
const WS_BASE = (
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "http://127.0.0.1:8000"
).replace(/^http/, "ws")

/** A pushed row. Read state and the resource link may be left out. */
type PushedNotification = Pick<
  NotificationItem,
  "id" | "notification_id" | "title" | "body" | "created_at" | "source"
> &
  Partial<NotificationItem>

type NotificationPage = Awaited<ReturnType<typeof listNotificationsFn>>
type NotificationPages = InfiniteData<NotificationPage, number>

export const notificationKeys = {
  all: (userId: EntityId) => ["notifications", userId] as const,
  lists: (userId: EntityId) =>
    [...notificationKeys.all(userId), "list"] as const,
  list: (userId: EntityId, unreadOnly: boolean) =>
    [...notificationKeys.lists(userId), { unreadOnly }] as const,
  unreadCount: (userId: EntityId) =>
    [...notificationKeys.all(userId), "unread-count"] as const,
}

export const notificationListOptions = (
  userId: EntityId,
  unreadOnly: boolean
) =>
  infiniteQueryOptions({
    queryKey: notificationKeys.list(userId, unreadOnly),
    queryFn: ({ pageParam }) =>
      listNotificationsFn({
        data: { page: pageParam, perPage: NOTIFICATIONS_PER_PAGE, unreadOnly },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.pagination
      return meta.page * meta.per_page < meta.total ? meta.page + 1 : undefined
    },
  })

export const unreadCountOptions = (userId: EntityId) =>
  queryOptions({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => getUnreadNotificationCountFn(),
  })

/** One page-by-page list of the user's notifications, newest first. */
export function useNotificationList(
  userId: EntityId | undefined,
  unreadOnly = false
) {
  const query = useInfiniteQuery({
    ...notificationListOptions(userId as EntityId, unreadOnly),
    enabled: !!userId,
  })

  const notifications = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  )

  return {
    notifications,
    total: query.data?.pages[0]?.pagination.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  }
}

/** Apply `change` to every cached notification, in every cached list. */
function patchLists(
  queryClient: QueryClient,
  userId: EntityId,
  change: (n: NotificationItem) => NotificationItem
) {
  queryClient.setQueriesData<NotificationPages>(
    { queryKey: notificationKeys.lists(userId) },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map(change),
        })),
      }
  )
}

/** Put a notification that just arrived at the top of every cached list. */
function prependToLists(
  queryClient: QueryClient,
  userId: EntityId,
  incoming: NotificationItem
) {
  queryClient.setQueriesData<NotificationPages>(
    { queryKey: notificationKeys.lists(userId) },
    (old) => {
      if (!old?.pages.length) return old
      const known = old.pages.some((page) =>
        page.data.some((n) => n.id === incoming.id)
      )
      if (known) return old
      const [first, ...rest] = old.pages
      return {
        ...old,
        pages: [
          {
            ...first,
            data: [incoming, ...first.data],
            pagination: {
              ...first.pagination,
              total: first.pagination.total + 1,
            },
          },
          ...rest,
        ],
      }
    }
  )
}

/**
 * The user's notifications: the latest ones, how many are unread, and a live
 * WebSocket subscription that keeps both up to date.
 *
 * Mount it once (see NotificationsProvider) so the app holds one socket.
 *
 * No access token ever touches this hook or the browser. Every REST call
 * and the WebSocket ticket go through TanStack Start server functions, which
 * read the real token out of the encrypted, httpOnly session cookie. The only
 * thing that reaches the client is a 30-second, single-use ticket used solely
 * to open the socket.
 *
 * Reconnects with exponential backoff (capped at 30s) if the socket drops,
 * fetching a brand new ticket on every attempt since each one is single-use.
 */
export function useNotifications(userId: EntityId | undefined) {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [authError, setAuthError] = useState(false)
  const retryDelay = useRef(WEBSOCKET_CONECTION_RETRY_DELAY)
  const socketRef = useRef<WebSocket | null>(null)
  const retryTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const list = useNotificationList(userId)

  // Zero until the first count arrives
  const { data: unreadCount = 0 } = useQuery({
    ...unreadCountOptions(userId as EntityId),
    enabled: !!userId,
  })

  const setUnreadCount = useCallback(
    (update: (count: number) => number) => {
      if (!userId) return
      queryClient.setQueryData<number>(
        notificationKeys.unreadCount(userId),
        (old) => Math.max(0, update(old ?? 0))
      )
    },
    [queryClient, userId]
  )

  const refreshAll = useCallback(() => {
    if (!userId) return
    queryClient.invalidateQueries({ queryKey: notificationKeys.all(userId) })
  }, [queryClient, userId])

  const markReadMutation = useMutation({
    mutationFn: (notification: NotificationItem) =>
      markNotificationReadFn({ data: { id: notification.id } }),
    onMutate: (notification) => {
      if (!userId || notification.is_read) return
      const readAt = new Date().toISOString()
      patchLists(queryClient, userId, (n) =>
        n.id === notification.id ? { ...n, is_read: true, read_at: readAt } : n
      )
      setUnreadCount((count) => count - 1)
    },
    // The optimistic update may be wrong; the server has the truth
    onError: refreshAll,
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadFn(),
    onMutate: () => {
      if (!userId) return
      const readAt = new Date().toISOString()
      patchLists(queryClient, userId, (n) =>
        n.is_read ? n : { ...n, is_read: true, read_at: readAt }
      )
      setUnreadCount(() => 0)
    },
    onError: refreshAll,
    // An unread-only list is now empty
    onSuccess: refreshAll,
  })

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    const connect = async () => {
      let ticket: string
      try {
        const result = await getWsTicketFn()
        ticket = result.ticket
      } catch {
        // Session cookie missing/expired server-side — no point retrying
        // with the same (non-existent) session. Surface it and stop.
        if (!cancelled) setAuthError(true)
        return
      }
      if (cancelled) return

      const ws = new WebSocket(
        `${WS_BASE}/v1/ws/${userId}?ticket=${encodeURIComponent(ticket)}`
      )
      socketRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        setIsConnected(true)
        setAuthError(false)
        retryDelay.current = WEBSOCKET_CONECTION_RETRY_DELAY // reset backoff on a healthy connection
        // Catch up on anything stored while the socket was down
        queryClient.invalidateQueries({
          queryKey: notificationKeys.all(userId),
        })
      }

      ws.onmessage = (event) => {
        let payload: { type?: string; data?: PushedNotification }
        try {
          payload = JSON.parse(event.data)
        } catch {
          return
        }
        if (payload.type !== "notification" || !payload.data) return

        // The server pushes the same row the list returns, so it goes
        // straight into the cache without waiting for a refetch.
        const incoming: NotificationItem = {
          ...payload.data,
          is_read: payload.data.is_read ?? false,
          read_at: payload.data.read_at ?? null,
          resource_type: payload.data.resource_type ?? null,
          resource_id: payload.data.resource_id ?? null,
        }
        prependToLists(queryClient, userId, incoming)
        if (!incoming.is_read) setUnreadCount((count) => count + 1)
      }

      ws.onclose = () => {
        if (cancelled) return
        setIsConnected(false)

        // 1008 = policy violation: ticket missing/expired/already used.
        // A fresh reconnect attempt gets a brand new ticket, so a normal
        // backoff retry is fine here (unlike a dead session, this is
        // just a stale ticket, not a stale login).
        retryTimeout.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30000)
          connect()
        }, retryDelay.current)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout.current)
      socketRef.current?.close()
    }
  }, [userId, queryClient, setUnreadCount])

  const { mutate: markReadMutate } = markReadMutation
  const { mutate: markAllReadMutate } = markAllReadMutation

  const markRead = useCallback(
    (notification: NotificationItem) => {
      if (!notification.is_read) markReadMutate(notification)
    },
    [markReadMutate]
  )

  const markAllRead = useCallback(
    () => markAllReadMutate(),
    [markAllReadMutate]
  )

  return {
    userId,
    notifications: list.notifications,
    unreadCount,
    isLoading: list.isLoading,
    hasNextPage: list.hasNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    fetchNextPage: list.fetchNextPage,
    isConnected,
    authError,
    markRead,
    markAllRead,
    refetch: refreshAll,
  }
}
