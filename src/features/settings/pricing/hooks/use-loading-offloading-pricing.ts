import { useQuery } from "@tanstack/react-query"
import {
  activeLoadingFreesQueryOptions,
  createCompanyLoadingFreesQueryOptions,
} from "../query-options"
import { ActivePricingSearchParams } from "../schemas"

export function useCompanyLoadingFees() {
  const { data, isLoading, error } = useQuery(
    createCompanyLoadingFreesQueryOptions()
  )

  return { isLoading, data: data?.data, error }
}

export function useClientLoadingFeesWithFallback(
  input: ActivePricingSearchParams
) {
  const { data, isLoading, error } = useQuery({
    ...activeLoadingFreesQueryOptions(input),
    enabled: !!input.clientId,
  })

  return { isLoading, data: data?.data, error }
}
