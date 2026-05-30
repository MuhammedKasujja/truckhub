import { fetchPermissionsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

const permissionsQueryKeys = {
  all: () => ["permissions-list"] as const,
} as const

export const createPermissionsQueryOptions = () =>
  queryOptions({
    queryKey: permissionsQueryKeys.all(),
    queryFn: fetchPermissionsFn,
    staleTime: 5 * 60 * 1000, // can refetch after for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })
