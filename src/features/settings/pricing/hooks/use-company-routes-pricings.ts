import { useQuery } from "@tanstack/react-query"
import { createBatchRoutePricingFn } from "../services"
import {
  companyActiveRoutePricingQueryOptions,
  companyRoutePricingQueryOptions,
} from "../query-options"
import type { BatchPricingPayload } from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

export function useRouteTonnagePricing() {
  const { data, isLoading, error } = useQuery(companyRoutePricingQueryOptions())

  return { isLoading, data: data, error }
}

export function useCompanyActiveRoutePricings() {
  return useQuery(companyActiveRoutePricingQueryOptions())
}

const useCreateCompanyRoutePricingBase = createEntityActionHook(
  createBatchRoutePricingFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

export function useCreateCompanyRoutePricing() {
  const { isPending, execute } = useCreateCompanyRoutePricingBase()

  function createRoutePricing(data: BatchPricingPayload) {
    return execute({ data })
  }
  return { isPending, createRoutePricing }
}
