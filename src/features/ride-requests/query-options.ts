import { queryOptions } from "@tanstack/react-query"
import { RideRequestListSearchParams } from "./schemas"
import { getRideDetailsFn, getRidesFn } from "./services"

export const rideQueryKeys = {
  all: () => ["rides"],
  list: () => [...rideQueryKeys.all(), "list"],
  details: () => [...rideQueryKeys.all(), "detail"],
  detail: (id: string) => [...rideQueryKeys.details(), id],
}

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
