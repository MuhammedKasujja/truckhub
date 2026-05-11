import { getTonnagesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const tonnageQueryKeys = {
  all: () => ["tonnages"] as const,
  list: () => [...tonnageQueryKeys.all(), "list"] as const,
  // details: () => [...tonnageQueryKeys.all(), "detail"],
  // detail: (id: string) => [...tonnageQueryKeys.details(), id],
} as const

export const createTonnagesQueryOptions = () =>
  queryOptions({
    queryKey: [...tonnageQueryKeys.list()],
    queryFn: () => getTonnagesFn(),
  })
