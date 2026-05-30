import { UserListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getUserProfileFn, getUsersFn } from "./services"

export const usersQueryKeys = {
  all: () => ["users"] as const,
  list: () => [...usersQueryKeys.all(), "list"] as const,
  details: () => [...usersQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
} as const

export const usersQueryOprions = (search: UserListSearchParams) =>
  queryOptions({
    queryKey: [...usersQueryKeys.list(), search],
    queryFn: () => getUsersFn({ data: search }),
  })

export const userProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: () => getUserProfileFn({ data: {id: userId} }),
  })
