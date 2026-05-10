import { getRidesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { RideRequestListSearchParams } from "./schemas"

export const rideQueryKeys = {
  all: () => ["rides"],
  list: () => [...rideQueryKeys.all(), "list"],
  details: () => [...rideQueryKeys.all(), "detail"],
  detail: (id: string) => [...rideQueryKeys.details(), id],
}

export const usersQueryOprions = (search: RideRequestListSearchParams) =>
  queryOptions({
    queryKey: [...rideQueryKeys.list(), search],
    queryFn: () => getRidesFn({ data: search }),
  })
