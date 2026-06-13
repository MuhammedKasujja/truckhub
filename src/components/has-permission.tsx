"use client";

import { UserPermission } from "@/features/auth/permissions";
import { NoPermissionCard } from "./no-permission-card";
import { useMemo } from "react";
import { useAuth } from "./providers/auth-context";

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
  const { user, hasPermission } = useAuth();
  const allowed = useMemo(() => hasPermission?.(permission), [permission, user]);

  if (allowed) return children;
  if (renderFallback)
    return <NoPermissionCard>{fallbackText}</NoPermissionCard>;
  return null;
}

export const Can = HasPermission