import { getUsersFn } from "./services"
import { UserListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const usersKeys = {
  all: () => ["users"],
  list: () => [...usersKeys.all(), "list"],
  details: () => [...usersKeys.all(), "detail"],
  detail: (id: string) => [...usersKeys.details(), id],
}

export const usersQueryOprions = (search: UserListSearchParams) =>
  queryOptions({
    queryKey: [...usersKeys.list(), search],
    queryFn: () => getUsersFn({ data: search }),
  })
