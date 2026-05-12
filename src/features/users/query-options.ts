import { UserListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getUserProfileFn, getUsersFn } from "./services"

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

export const userProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUserProfileFn({ data: {id: userId} }),
  })
