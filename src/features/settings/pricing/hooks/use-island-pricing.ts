import { IslandsListPricingRequest } from "../schemas"
import { createBatchIslandPricingsFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

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
  return { isPending, createIslandPricing, error}
}
