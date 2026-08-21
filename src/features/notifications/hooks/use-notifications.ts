import { useEffect, useRef, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getWsTicketFn,
  listNotificationsFn,
  markNotificationReadFn,
  markAllNotificationsReadFn,
} from "../services"
import { EntityId } from "@/schemas"
import { NotificationItem } from "../types"

const WEBSOCKET_CONECTION_RETRY_DELAY = 1000

// The browser still connects directly to FastAPI for the socket itself —
// only the token is kept off the client. This just needs to be a public
// env var pointing at your FastAPI host (VITE_API_URL, not FASTAPI_URL —
// that server-only one lives in server/notifications.functions.ts).
// const WS_BASE = import.meta.env.BACKEND_URL.replace(/^http/, "ws")
const WS_BASE = "http://127.0.0.1:8000".replace(/^http/, "ws")

function notificationsKey(userId: EntityId) {
  return ["notifications", userId] as const
}

/**
 * Subscribes to live notifications for `userId` over WebSocket and keeps
 * them merged into the TanStack Query cache.
 *
 * No access token ever touches this hook or the browser. Every REST call
 * and the WebSocket connection itself go through TanStack Start server
 * functions, which read the real token out of the encrypted, httpOnly
 * session cookie server-side. The only thing that reaches the client is
 * a 30-second, single-use ticket used solely to open the socket.
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
  const retryTimeout = useRef<ReturnType<typeof setTimeout>>()

  const query = useQuery({
    queryKey: userId ? notificationsKey(userId) : ["notifications", "disabled"],
    queryFn: () => listNotificationsFn({ data: { userId: userId! } }),
    enabled: !!userId,
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId: EntityId) =>
      markNotificationReadFn({
        data: { userId: userId as EntityId, notificationId },
      }),
    onSuccess: (_data, notificationId) => {
      if (!userId) return
      queryClient.setQueryData<NotificationItem[]>(
        notificationsKey(userId),
        (old) =>
          old?.map((n) =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          ) ?? old
      )
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadFn({ data: { userId: userId! } }),
    onSuccess: () => {
      if (!userId) return
      queryClient.setQueryData<NotificationItem[]>(
        notificationsKey(userId),
        (old) => old?.map((n) => ({ ...n, is_read: true })) ?? old
      )
    },
  })

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    const connect = async () => {
      let ticket: string
      try {
        const result = await getWsTicketFn()
        ticket = result.ticket
      } catch (error){
        // Session cookie missing/expired server-side — no point retrying
        // with the same (non-existent) session. Surface it and stop.
        console.log("WS_BASE_Error", WS_BASE, "error", error?.toString())
        if (!cancelled) setAuthError(true)
        return
      }
      if (cancelled) return
      console.log("Connecting to socket...")

      const ws = new WebSocket(
        `${WS_BASE}/v1/ws/${userId}?ticket=${encodeURIComponent(ticket)}`
      )
      socketRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        setIsConnected(true)
        setAuthError(false)
        retryDelay.current = WEBSOCKET_CONECTION_RETRY_DELAY // reset backoff on a healthy connection
      }

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data)
        if (payload.type !== "notification") return
        console.log("payload", payload)
        const data = payload.data

        // Prepend the new notification into the cached list without
        // waiting for a refetch. Server sends the Notification, not the
        // per-recipient row, so we synthesize a temporary row id until
        // the next refetch reconciles it with the real recipient id.
        queryClient.setQueryData<NotificationItem[]>(
          notificationsKey(userId),
          (old = []) => [
            {
              id: -Number(data.id), // placeholder, replaced on next refetch
              notification_id: data.id,
              title: data.title,
              body: data.body,
              created_at: data.created_at,
              is_read: false,
              read_at: null,
            },
            ...old,
          ]
        )
      }

      ws.onclose = (event) => {
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
  }, [userId, queryClient])

  const markRead = useCallback(
    (notificationId: EntityId) => markReadMutation.mutate(notificationId),
    [markReadMutation]
  )

  const markAllRead = useCallback(
    () => markAllReadMutation.mutate(),
    [markAllReadMutation]
  )

  const notifications = query.data ?? []
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isConnected,
    authError,
    markRead,
    markAllRead,
    refetch: query.refetch,
  }
}
