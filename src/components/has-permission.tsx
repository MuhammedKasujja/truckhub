"use client";

import { UserPermission } from "@/features/auth/permissions";
import { NoPermissionCard } from "./no-permission-card";
import { useAuth } from "./providers/auth-provider";
import { useMemo } from "react";

export function HasPermission({
  permission,
  renderFallback = false,
  fallbackText,
  children,
}: {
  permission: UserPermission;
  renderFallback?: boolean;
  fallbackText?: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  const allowed = useMemo(() => hasPermission(permission), [permission]);

  if (allowed) return children;
  if (renderFallback)
    return <NoPermissionCard>{fallbackText}</NoPermissionCard>;
  return null;
}

export const Can = HasPermission