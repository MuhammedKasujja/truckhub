import { User } from "@/features/auth/types"
import { createContext, useContext } from "react"
import { UserPermission } from "@/features/auth/permissions"

export const AuthContext = createContext<{
  user: User | null | undefined
  hasPermission?: (permission: UserPermission) => boolean
  refresh: () => void
} | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
