import { useQuery } from "@tanstack/react-query"
import { DistancePricingRequest } from "../schemas"
import { createBatchDistancePricingFn } from "../services"
import { distancePricingQueryOptions } from "../query-options"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

export function useDistanceTonnagePricing() {
  const { data, isLoading, error } = useQuery(distancePricingQueryOptions())

  return { isLoading, data: data?.data, error }
}

const useCreateDistanceTonnageBase = createEntityActionHook(
  createBatchDistancePricingFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

export function useCreateDistanceTonnage() {
  const { isPending, execute } = useCreateDistanceTonnageBase()

  function createDistanceTonnage(pricings: DistancePricingRequest[]) {
    return execute({ data: { pricings } })
  }
  return { isPending, createDistanceTonnage }
}
