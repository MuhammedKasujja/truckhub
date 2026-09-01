import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { clientRoutePricingQueryOptions } from "../query-options"

export function useClientRoutingPricing(clientId: EntityId) {
  const { data, isLoading, isFetching } = useQuery(clientRoutePricingQueryOptions(clientId))

  return { isLoading, data: data?.data, isFetching }
}
