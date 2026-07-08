"use client"

import { UserPermission } from "@/features/auth/permissions"
import { NoPermissionCard } from "./no-permission-card"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function HasPermission({
  permission,
  renderFallback = false,
  fallbackText,
  children,
}: {
  permission: UserPermission
  renderFallback?: boolean
  fallbackText?: string
  children: React.ReactNode
}) {
  const { hasPermission } = usePermissions()

  if (hasPermission(permission)) return children
  
  if (renderFallback) return <NoPermissionCard>{fallbackText}</NoPermissionCard>
  return null
}

export const Can = HasPermission
