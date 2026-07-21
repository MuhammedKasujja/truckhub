import { getRolesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const rolesQueryKeys = {
  all: () => ["roles"] as const,
  list: () => [...rolesQueryKeys.all(), "list"] as const,
  details: () => [...rolesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...rolesQueryKeys.details(), id] as const,
} as const

export const createRolesQueryOptions = () =>
  queryOptions({
    queryKey: [...rolesQueryKeys.list()],
    queryFn: () => getRolesFn(),
  })
