import { queryOptions } from "@tanstack/react-query"
import {
  getIslandPricingsFn,
  getDistanceTonnagePricingFn,
  getLoadingOffloadingFreesFn,
} from "./services"

export const distancePricingQueryKeys = {
  all: () => ["distance-pricing"] as const,
  list: () => [...distancePricingQueryKeys.all(), "list"] as const,
} as const

export const routePricingQueryKeys = {
  all: () => ["routes-pricings"] as const,
  list: () => [...routePricingQueryKeys.all(), "list"] as const,
} as const

export const loadingFeesQueryKeys = {
  all: () => ["loading-fees"] as const,
  list: () => [...loadingFeesQueryKeys.all(), "list"] as const,
} as const

export const islandPricingQueryKeys = {
  all: () => ["island-pricing"] as const,
  list: () => [...islandPricingQueryKeys.all(), "list"] as const,
} as const

export const distancePricingQueryOptions = () =>
  queryOptions({
    queryKey: distancePricingQueryKeys.list(),
    queryFn: getDistanceTonnagePricingFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyRoutePricingQueryOptions = () =>
  queryOptions({
    queryKey: routePricingQueryKeys.list(),
    queryFn: getDistanceTonnagePricingFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyLoadingFreesQueryOptions = () =>
  queryOptions({
    queryKey: loadingFeesQueryKeys.list(),
    queryFn: getLoadingOffloadingFreesFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyIslandPricingQueryOptions = () =>
  queryOptions({
    queryKey: islandPricingQueryKeys.list(),
    queryFn: getIslandPricingsFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })
