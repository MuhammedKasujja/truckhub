import { queryOptions } from "@tanstack/react-query"
import {
  getIslandPricingsFn,
  getRouteTonnagePricingFn,
  getCompanyPricingDatesFn,
  getDistanceTonnagePricingFn,
  getLoadingOffloadingFreesFn,
} from "./services"
import { PricingSearchParams } from "./schemas"

export const pricingQueryKeys = {
  all: () => ["pricings"] as const,
  list: () => [...pricingQueryKeys.all(), "list"] as const,
  distances: (filter: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "distances", filter] as const,
  routes: (filter: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "routes", filter] as const,
  loadingOffloading: (filter: PricingSearchParams| undefined) =>
    [...pricingQueryKeys.list(), "loading-offloading", filter] as const,
  islands: (date: PricingSearchParams | undefined) =>
    [...pricingQueryKeys.list(), "islands-fees", date] as const,
  companyDates: () => [...pricingQueryKeys.list(), "islands-fees"] as const,
} as const

export const distancePricingQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.distances(data),
    queryFn: () =>
      getDistanceTonnagePricingFn({ data:{...data} }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyRoutePricingQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.routes(data),
    queryFn: () => getRouteTonnagePricingFn({ data:{...data} }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyLoadingFreesQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.loadingOffloading(data),
    queryFn: () =>
      getLoadingOffloadingFreesFn({ data:{...data} }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyIslandPricingQueryOptions = (data?: PricingSearchParams) =>
  queryOptions({
    queryKey: pricingQueryKeys.islands(data),
    queryFn: () => getIslandPricingsFn({ data:{...data} }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyPricingDatesQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.companyDates(),
    queryFn: getCompanyPricingDatesFn,
    gcTime: 60 * 60 * 1000, // Cache pricing dates for 60 minutes
  })
