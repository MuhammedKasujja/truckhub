"use client"

import { NoPermissionCard } from "./no-permission-card"
import type { OwnedResource, PermissionCheck } from "@/lib/permissions"
import type { UserPermission } from "@/features/auth/permissions"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function HasPermission({
  permission,
  resource,
  renderFallback = false,
  fallbackText,
  children,
}: {
  /** One key, or several that are all required (e.g. `ModuleAccess.quotations`) */
  permission: PermissionCheck
  /** When given, also checks "own" permissions against this record */
  resource?: OwnedResource
  renderFallback?: boolean
  fallbackText?: string
  children: React.ReactNode
}) {
  const { hasPermission, canOn } = usePermissions()

  const keys: readonly UserPermission[] =
    typeof permission === "string" ? [permission] : permission
  const allowed = resource
    ? keys.every((key) => canOn(key, resource))
    : hasPermission(permission)

  if (allowed) return children

  if (renderFallback) return <NoPermissionCard>{fallbackText}</NoPermissionCard>

  if (fallbackText) return <span>{fallbackText}</span>
  return null
}

export const Can = HasPermission
