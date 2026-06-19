import { createTaxRatesQueryOptions } from "../query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useTaxRatesQuery() {
  const { data, isLoading, refetch } = useQuery(createTaxRatesQueryOptions())

  return { data: data?.data, error: data?.error, isLoading, refetch }
}

export function useTaxRatesSuspense() {
  const {
    data: { data, error },
  } = useSuspenseQuery(createTaxRatesQueryOptions())

  return { data, error }
}
