import { UserListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getUsersFn,
  getUserDetailsFn,
  getUserProfileDetailsFn,
} from "./services"

export const usersQueryKeys = {
  all: () => ["users"] as const,
  list: () => [...usersQueryKeys.all(), "list"] as const,
  details: () => [...usersQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
  authProfile: () => [...usersQueryKeys.details(), "profile"] as const,
} as const

export const usersQueryOprions = (search: UserListSearchParams) =>
  queryOptions({
    queryKey: [...usersQueryKeys.list(), search],
    queryFn: () => getUsersFn({ data: search }),
  })

export const userDetailsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: () => getUserDetailsFn({ data: { id: userId } }),
  })

export const userProfileQueryOptions = () =>
  queryOptions({
    queryKey: usersQueryKeys.authProfile(),
    queryFn: () => getUserProfileDetailsFn(),
  })
