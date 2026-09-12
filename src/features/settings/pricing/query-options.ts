import { queryOptions } from "@tanstack/react-query"
import {
  getIslandPricingsFn,
  getRouteTonnagePricingFn,
  getCompanyPricingDatesFn,
  getDistanceTonnagePricingFn,
  getLoadingOffloadingFreesFn,
} from "./services"

export const pricingQueryKeys = {
  all: () => ["pricings"] as const,
  list: () => [...pricingQueryKeys.all(), "list"] as const,
  distances: () => [...pricingQueryKeys.list(), "distances"] as const,
  routes: () => [...pricingQueryKeys.list(), "routes"] as const,
  loadingOffloading: () =>
    [...pricingQueryKeys.list(), "loading-offloading"] as const,
  islands: () => [...pricingQueryKeys.list(), "islands-fees"] as const,
  companyDates: () => [...pricingQueryKeys.list(), "islands-fees"] as const,
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
    queryFn: getRouteTonnagePricingFn,
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

export const companyPricingDatesQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.companyDates(),
    queryFn: getCompanyPricingDatesFn,
    gcTime: 60 * 60 * 1000, // Cache for 60 minutes
  })
