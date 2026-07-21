import { useEffect, useRef } from "react"
import { getCurrentUser } from "@/lib/auth"
import { logoutFn } from "@/features/auth/services"
import { useServerFn } from "@tanstack/react-start"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export function useAuthSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const fetchUser = useServerFn(getCurrentUser)
  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchUser(),
    staleTime: 10 * 60 * 1000, // 10 min — staleTime means repeated searches for the same queryKey(s) hit the cache instead of the network.
    refetchInterval: 5 * 60 * 1000, // actively poll every 5 min, regardless of focus
    retry: false,
  })

  // ── Idle-tab detection ────────────────────────────────────────────────────
  // If we previously had a user and the poll now returns null, the refresh
  // token died server-side (expired naturally or revoked elsewhere).
  const hadUser = useRef(false)

  useEffect(() => {
    if (user) {
      hadUser.current = true
      return
    }
    if (!isLoading && user === null && hadUser.current) {
      logout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading])

  async function logout() {
    try {
      queryClient.setQueryData(["currentUser"], null)
      hadUser.current = false
      await logoutFn()
    } catch {
      navigate({ to: "/login" })
    }
  }

  return {
    isLoading,
    user,
    refresh: refetch,
    logout,
  }
}
