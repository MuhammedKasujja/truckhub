import { queryOptions } from "@tanstack/react-query"
import {
  getIslandPricingsFn,
  getDistanceTonnagePricingFn,
  getLoadingOffloadingFreesFn,
} from "./services"

export const pricingQueryKeys = {
  all: () => ["pricings"] as const,
  distances: () => [...pricingQueryKeys.all(), "distances", "list"] as const,
  routes: () => [...pricingQueryKeys.all(), "routes", "list"] as const,
  loadingOffloading: () =>
    [...pricingQueryKeys.all(), "loading-offloading", , "list"] as const,
  islands: () => [...pricingQueryKeys.all(), "islands-fees", , "list"] as const,
} as const

export const distancePricingQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.distances(),
    queryFn: getDistanceTonnagePricingFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyRoutePricingQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.routes(),
    queryFn: getDistanceTonnagePricingFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyLoadingFreesQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.loadingOffloading(),
    queryFn: getLoadingOffloadingFreesFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyIslandPricingQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.islands(),
    queryFn: getIslandPricingsFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })
