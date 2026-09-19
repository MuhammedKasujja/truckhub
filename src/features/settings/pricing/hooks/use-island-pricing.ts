import { useQuery } from "@tanstack/react-query"
import { IslandsListPricingRequest } from "../schemas"
import { createBatchIslandPricingsFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { createCompanyIslandPricingQueryOptions } from "../query-options"

export function useCompanyIslandsPricing() {
  const { data, isLoading, error } = useQuery(
    createCompanyIslandPricingQueryOptions()
  )

  return { isLoading, data: data, error }
}

const useCreateIslandPricingBase = createEntityActionHook(
  createBatchIslandPricingsFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

export function useCreateIslandPricing() {
  const { isPending, execute, error } = useCreateIslandPricingBase()

  function createIslandPricing(data: IslandsListPricingRequest) {
    return execute({ data })
  }
  return { isPending, createIslandPricing, error }
}
