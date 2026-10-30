import { useQuery } from "@tanstack/react-query"
import {
  companyRoutePricingQueryOptions,
  companyActiveRoutePricingQueryOptions,
} from "../query-options"

export function useRouteTonnagePricing() {
  const { data, isLoading, error } = useQuery(companyRoutePricingQueryOptions())

  return { isLoading, data: data, error }
}

export function useCompanyActiveRoutePricings() {
  return useQuery(companyActiveRoutePricingQueryOptions())
}
