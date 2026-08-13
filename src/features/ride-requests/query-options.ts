import { SearchQuery } from "@/types"
import { queryOptions } from "@tanstack/react-query"
import { RideRequestListSearchParams } from "./schemas"
import { getRideDetailsFn, getRidesFn } from "./services"

export const rideQueryKeys = {
  all: () => ["rides"] as const,
  list: () => [...rideQueryKeys.all(), "list"] as const,
  details: () => [...rideQueryKeys.all(), "detail"] as const,
  search: (search?: string) => [...rideQueryKeys.all(), "search", search] as const,
  detail: (id: string) => [...rideQueryKeys.details(), id] as const,
} as const

export const createRidesQueryOptions = (search: RideRequestListSearchParams) =>
  queryOptions({
    queryKey: [...rideQueryKeys.list(), search],
    queryFn: () => getRidesFn({ data: search }),
  })

export const rideDetailsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: rideQueryKeys.detail(id),
    queryFn: () => getRideDetailsFn({ data: { id } }),
  })

export const rideListSearchQueryOptions = ({ search }: SearchQuery) =>
  queryOptions({
    queryKey: rideQueryKeys.search(search),
    queryFn: () => getRidesFn({ data: { search } }),
  })