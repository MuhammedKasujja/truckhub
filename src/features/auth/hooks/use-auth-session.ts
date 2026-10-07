import { getCurrentUser } from "@/lib/auth"
import { logoutFn } from "@/features/auth/services"
import { useServerFn } from "@tanstack/react-start"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const CURRENT_USER_KEY = ["currentUser"] as const

export function useAuthSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const fetchUser = useServerFn(getCurrentUser)
  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [CURRENT_USER_KEY],
    queryFn: () => fetchUser(),
    staleTime: 10 * 60 * 1000, // serve from cache for 10 min
    refetchInterval: 5 * 60 * 1000, // poll every 5 min
    refetchIntervalInBackground: true, // keep polling in hidden tabs (off by default)
    retry: false,
  })

  // ── Idle-tab detection ────────────────────────────────────────────────────
  // If we previously had a user and the poll now returns null, the refresh
  // token died server-side (expired naturally or revoked elsewhere).
  const hadUser = useRef(false)
  const loggingOut = useRef(false)

  const logout = useCallback(async () => {
    // Guard: the idle timer, the "Logout now" button and the poll below
    // can all call this at nearly the same time.
    if (loggingOut.current) return
    loggingOut.current = true
    hadUser.current = false

    try {
      queryClient.setQueryData([CURRENT_USER_KEY], null)
      await logoutFn()
    } catch {
      // Server call failed (offline, 5xx). The local session is already
      // cleared, so still send the user to login.
    } finally {
      navigate({ to: "/login" })
      loggingOut.current = false
    }
  }, [queryClient, navigate, logoutFn])

  // ── Dead-session detection ────────────────────────────────────────────
  // We had a user and the poll now returns null: the refresh token died
  // server-side (expired naturally or revoked elsewhere).
  useEffect(() => {
    if (user) {
      hadUser.current = true
      return
    }
    if (!isLoading && user === null && hadUser.current) {
      logout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, logout])

  return {
    isLoading,
    user,
    refresh: refetch,
    logout,
  }
}
