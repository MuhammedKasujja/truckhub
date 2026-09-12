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
  distances: (date: string | undefined) =>
    [...pricingQueryKeys.list(), "distances", date] as const,
  routes: (date: string | undefined) =>
    [...pricingQueryKeys.list(), "routes", date] as const,
  loadingOffloading: (date: string | undefined) =>
    [...pricingQueryKeys.list(), "loading-offloading", date] as const,
  islands: (date: string | undefined) =>
    [...pricingQueryKeys.list(), "islands-fees", date] as const,
  companyDates: () => [...pricingQueryKeys.list(), "islands-fees"] as const,
} as const

export const distancePricingQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: pricingQueryKeys.distances(date),
    queryFn: () =>
      getDistanceTonnagePricingFn({ data: { referenceDate: date } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyRoutePricingQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: pricingQueryKeys.routes(date),
    queryFn: () => getRouteTonnagePricingFn({ data: { referenceDate: date } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyLoadingFreesQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: pricingQueryKeys.loadingOffloading(date),
    queryFn: () =>
      getLoadingOffloadingFreesFn({ data: { referenceDate: date } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createCompanyIslandPricingQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: pricingQueryKeys.islands(date),
    queryFn: () => getIslandPricingsFn({ data: { referenceDate: date } }),
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const companyPricingDatesQueryOptions = () =>
  queryOptions({
    queryKey: pricingQueryKeys.companyDates(),
    queryFn: getCompanyPricingDatesFn,
    gcTime: 60 * 60 * 1000, // Cache pricing dates for 60 minutes
  })
