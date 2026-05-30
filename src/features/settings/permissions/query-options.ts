import { fetchPermissionsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const rolesQueryKeys = {
  all: () => ["roles"] as const,
  list: () => [...rolesQueryKeys.all(), "list"] as const,
  details: () => [...rolesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...rolesQueryKeys.details(), id] as const,
} as const

export const createPermissionsQueryOptions = () =>
  queryOptions({
    queryKey: ["permissions-list"],
    queryFn: fetchPermissionsFn,
    staleTime: 5 * 60 * 1000, // can refetch after for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })
