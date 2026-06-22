import { queryOptions } from "@tanstack/react-query"
import { getDistanceTonnagePricingFn } from "./services"

export const distancePricingQueryKeys = {
  all: () => ["distance-pricing"] as const,
  list: () => [...distancePricingQueryKeys.all(), "list"] as const,
} as const

export const distancePricingQueryOptions = () =>
  queryOptions({
    queryKey: distancePricingQueryKeys.list(),
    queryFn: getDistanceTonnagePricingFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })
