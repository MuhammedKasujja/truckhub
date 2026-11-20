import { useQuery } from "@tanstack/react-query"
import {
  activeLoadingFreesQueryOptions,
  createCompanyLoadingFreesQueryOptions,
} from "../query-options"
import { createBatchLoadingPricingFn } from "../services"
import type {
  ActivePricingSearchParams,
  LoadingOffloadingPricingRequest,
} from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

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

const useCreateCompanyLoadingPricingBase = createEntityActionHook(
  createBatchLoadingPricingFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

export function useCreateCompanyLoadingPricing() {
  const { isPending, execute } = useCreateCompanyLoadingPricingBase()

  function createLoadingPricing(data: LoadingOffloadingPricingRequest) {
    return execute({ data })
  }
  return { isPending, createLoadingPricing }
}
