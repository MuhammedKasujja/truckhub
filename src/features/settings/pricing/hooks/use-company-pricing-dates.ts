import { useQuery } from "@tanstack/react-query"
import { companyPricingDatesQueryOptions } from "../query-options"

export function useCompanyPricingDates() {
  const { data, isLoading, error } = useQuery(companyPricingDatesQueryOptions())

  return { isLoading, data: data?.data, error }
}
