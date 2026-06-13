"use client"

import { User } from "@/features/auth/types"
import { getCurrentUser } from "@/lib/auth"
import { checkUserPermission } from "@/lib/permissions"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { useCallback, type ReactNode } from "react"
import { AuthContext } from "./auth-context"

export function AuthProvider({
  children,
}: {
  user: User
  children: ReactNode
}) {
  const fetchUser = useServerFn(getCurrentUser)

  const { data, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchUser(),
    staleTime: 5 * 60 * 1000, // 5 min — consider this data as fresh for only 5 minutes
    refetchInterval: 2 * 60 * 1000, // actively poll every 2 min, regardless of focus
    retry: false,
  })

  const hasPermission = data ? checkUserPermission(data) : undefined

  return (
    <AuthContext.Provider
      value={{ user: data, hasPermission, refresh: refetch }}
    >
      {children}
    </AuthContext.Provider>
  )
}
