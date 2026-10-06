import { useQuery } from "@tanstack/react-query"
import { ListDistancePricingRequest } from "../schemas"
import { createBatchDistancePricingFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { companyActiveDistancePricingQueryOptions } from "../query-options"

export function useDistanceTonnagePricing() {
  const { data, isLoading, error } = useQuery(
    companyActiveDistancePricingQueryOptions()
  )

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

  function createDistanceTonnage(data: ListDistancePricingRequest) {
    return execute({ data })
  }
  return { isPending, createDistanceTonnage }
}
