"use client"

import { NoPermissionCard } from "./no-permission-card"
import type { OwnedResource } from "@/lib/permissions"
import type { UserPermission } from "@/features/auth/permissions"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function HasPermission({
  permission,
  resource,
  renderFallback = false,
  fallbackText,
  children,
}: {
  permission: UserPermission
  /** When given, also checks "own" permissions against this record */
  resource?: OwnedResource
  renderFallback?: boolean
  fallbackText?: string
  children: React.ReactNode
}) {
  const { hasPermission, canOn } = usePermissions()

  const allowed = resource
    ? canOn(permission, resource)
    : hasPermission(permission)

  if (allowed) return children

  if (renderFallback) return <NoPermissionCard>{fallbackText}</NoPermissionCard>

  if (fallbackText) return <span>{fallbackText}</span>
  return null
}

export const Can = HasPermission
