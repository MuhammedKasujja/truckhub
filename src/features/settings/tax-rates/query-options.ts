import { getTaxRatesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const taxRateQueryKeys = {
  all: () => ["tax-rates"] as const,
  list: () => [...taxRateQueryKeys.all(), "list"] as const,
  details: () => [...taxRateQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...taxRateQueryKeys.details(), id] as const,
} as const

export const createTaxRatesQueryOptions = () =>
  queryOptions({
    queryKey: taxRateQueryKeys.list(),
    queryFn: () => getTaxRatesFn(),
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
