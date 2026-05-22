import { getRolesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const RoleQueryKeys = {
  all: () => ["roles"] as const,
  list: () => [...RoleQueryKeys.all(), "list"] as const,
  details: () => [...RoleQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...RoleQueryKeys.details(), id] as const,
} as const

export const createRolesQueryOptions = () =>
  queryOptions({
    queryKey: [...RoleQueryKeys.list()],
    queryFn: () => getRolesFn(),
  })
