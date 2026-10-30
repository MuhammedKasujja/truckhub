import { useQuery } from "@tanstack/react-query"
import { IslandsListPricingRequest } from "../schemas"
import { createBatchIslandPricingsFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { companyActiveIslandPricingQueryOptions, createCompanyIslandPricingQueryOptions } from "../query-options"

export function useCompanyIslandsPricing() {
  return useQuery(createCompanyIslandPricingQueryOptions())
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


export function useCompanyActiveIslandsPricing() {
  return useQuery(companyActiveIslandPricingQueryOptions())
}