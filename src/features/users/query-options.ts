import { getUsersFn } from "./services"
import { UserListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const usersKeys = {
  all: () => ["users"] as const,
  list: () => [...usersKeys.all(), "list"] as const,
  details: () => [...usersKeys.all(), "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
} as const

export const usersQueryOprions = (search: UserListSearchParams) =>
  queryOptions({
    queryKey: [...usersKeys.list(), search],
    queryFn: () => getUsersFn({ data: search }),
  })
