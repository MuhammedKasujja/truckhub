import { useQuery } from "@tanstack/react-query"
import { createClientBatchRoutePricingFn } from "../services"
import {
  clientActiveRoutePricingQueryOptions,
  clientRoutePricingQueryOptions,
} from "../query-options"
import type { ClientPricingSearchParam } from "../schemas"
import type { EntityId } from "@/schemas"
import type { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

export function useClientRoutingPricing(search: ClientPricingSearchParam) {
  return useQuery(clientRoutePricingQueryOptions(search))
}

export function useClientActiveRoutingPricing(clientId: EntityId) {
  return useQuery(clientActiveRoutePricingQueryOptions(clientId))
}

const useCreateClientRoutePricingBase = createEntityActionHook(
  createClientBatchRoutePricingFn,
  (invalidator, input) => {
    // Covers the client's pricing dates, route pricing and active pricing
    invalidator.clients.profile(input.data.client_id!).invalidate()
  }
)

export function useCreateClientRoutePricing() {
  const { isPending, execute } = useCreateClientRoutePricingBase()

  function createClientRoutePricing(data: BatchPricingPayload) {
    return execute({ data })
  }
  return { isPending, createClientRoutePricing }
}
