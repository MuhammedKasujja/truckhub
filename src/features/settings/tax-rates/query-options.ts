import { getTaxRatesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const TaxRateQueryKeys = {
  all: () => ["tax-rates"] as const,
  list: () => [...TaxRateQueryKeys.all(), "list"] as const,
  details: () => [...TaxRateQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...TaxRateQueryKeys.details(), id] as const,
} as const

export const createTaxRatesQueryOptions = () =>
  queryOptions({
    queryKey: [...TaxRateQueryKeys.list()],
    queryFn: () => getTaxRatesFn(),
  })
