import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { ClientPricingSearchParam } from "../schemas"
import {
  clientRoutePricingQueryOptions,
  clientActiveRoutePricingQueryOptions,
} from "../query-options"

export function useClientRoutingPricing(search: ClientPricingSearchParam) {
  return useQuery(clientRoutePricingQueryOptions(search))
}

export function useClientActiveRoutingPricing(clientId: EntityId) {
  return useQuery(clientActiveRoutePricingQueryOptions(clientId))
}
