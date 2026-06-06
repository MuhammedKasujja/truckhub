import { queryOptions } from "@tanstack/react-query"
import { getEntityNumberPatternsFn } from "./services"

export const entityNumberPattensQueryKeys = {
  all: () => ["entity-number-patterns"] as const,
  list: () => [...entityNumberPattensQueryKeys.all(), "list"] as const,
} as const

export const entityNumberPatternsQueryOptions = () =>
  queryOptions({
    queryKey: entityNumberPattensQueryKeys.list(),
    queryFn: () => getEntityNumberPatternsFn(),
  })
