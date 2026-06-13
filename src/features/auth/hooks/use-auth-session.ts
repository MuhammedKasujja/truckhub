import { getCurrentUser } from "@/lib/auth"
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
    staleTime: 5 * 60 * 1000, // 5 min — consider this data as fresh for only 5 minutes
    refetchInterval: 2 * 60 * 1000, // actively poll every 2 min, regardless of focus
    retry: false,
  })

  function handleSessionExpired() {
    queryClient.setQueryData(["currentUser"], null)
    navigate({ to: "/login" })
  }

  return {
    isLoading,
    user,
    refresh: refetch,
    handleSessionExpired,
  }
}
