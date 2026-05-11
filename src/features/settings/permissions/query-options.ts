import { queryOptions } from "@tanstack/react-query"
import { fetchPermissionsFn, getRolesFn } from "./services"

export const rolesQueryKeys = {
  all: () => ["roles"] as const,
  list: () => [...rolesQueryKeys.all(), "list"] as const,
  details: () => [...rolesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...rolesQueryKeys.details(), id] as const,
} as const

export const createRolesListQueryOptions = () =>
  queryOptions({
    queryKey: rolesQueryKeys.list(),
    queryFn: getRolesFn,
  })

export const createPermissionsQueryOptions = () =>
  queryOptions({
    queryKey: ["permissions-list"],
    queryFn: fetchPermissionsFn,
  })
