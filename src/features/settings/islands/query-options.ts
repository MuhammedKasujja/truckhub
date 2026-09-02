import { getIslandListFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const islandsQueryKeys = {
  all: () => ["islands"] as const,
  list: () => [...islandsQueryKeys.all(), "list"] as const,
  details: () => [...islandsQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...islandsQueryKeys.details(), id] as const,
} as const

export const islandsQueryOptions = () =>
  queryOptions({
    queryKey: islandsQueryKeys.list(),
    queryFn: () => getIslandListFn(),
  })
