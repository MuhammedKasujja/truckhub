import { queryOptions } from "@tanstack/react-query"
import {
  getIslandPricingsFn,
  getRouteTonnagePricingFn,
  getCompanyPricingDatesFn,
  getDistanceTonnagePricingFn,
  getLoadingOffloadingFreesFn,
  getActiveRouteTonnagePricingFn,
  getActiveLoadingOffloadingFreesFn,
  getCompanyActiveDistancePricingFn,
} from "./services"
import { ActivePricingSearchParams, PricingSearchParams } from "./schemas"

export const pricingQueryKeys = {
  all: () => ["pricings"] as const,
  list: () => [...pricingQueryKeys.all(), "list"] as const,
  distances: (filter?: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "distances", filter] as const,
  distanceActive: () =>
    [...pricingQueryKeys.list(), "distances", "active"] as const,
  routes: (filter?: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "routes", filter] as const,
  routesActivePricing: () =>
    [...pricingQueryKeys.list(), "routes", "active"] as const,
  loadingOffloading: (filter?: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "loading-offloading", filter] as const,
  activeLoadingOffloading: (filter?: ActivePricingSearchParams | undefined) =>
    [
      ...pricingQueryKeys.list(),
      "loading-offloading",
      "active",
      filter,
    ] as const,
  islands: (filter?: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "islands-fees", filter] as const,
  companyDates: () => [...pricingQueryKeys.list(), "islands-fees"] as const,
} as const

export const distancePricingQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.distances(data),
    queryFn: () => getDistanceTonnagePricingFn({ data: { ...data } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyActiveDistancePricingQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.distanceActive(),
    queryFn: () => getCompanyActiveDistancePricingFn(),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyRoutePricingQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.routes(data),
    queryFn: () => getRouteTonnagePricingFn({ data: { ...data } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyActiveRoutePricingQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.routesActivePricing(),
    queryFn: () => getActiveRouteTonnagePricingFn(),
    gcTime: 60 * 60 * 1000, // Cache for 1 hour
  })

export const createCompanyLoadingFreesQueryOptions = (
  data?: PricingSearchParams
) =>
  queryOptions({
    queryKey: pricingQueryKeys.loadingOffloading(data),
    queryFn: () => getLoadingOffloadingFreesFn({ data: { ...data } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const activeLoadingFreesQueryOptions = (
  data?: ActivePricingSearchParams
) =>
  queryOptions({
    queryKey: pricingQueryKeys.activeLoadingOffloading(data),
    queryFn: () => getActiveLoadingOffloadingFreesFn({ data: { ...data } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyIslandPricingQueryOptions = (
  data?: PricingSearchParams
) =>
  queryOptions({
    queryKey: pricingQueryKeys.islands(data),
    queryFn: () => getIslandPricingsFn({ data: { ...data } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyPricingDatesQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.companyDates(),
    queryFn: getCompanyPricingDatesFn,
    gcTime: 60 * 60 * 1000, // Cache pricing dates for 60 minutes
  })
