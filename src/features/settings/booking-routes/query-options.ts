import { getBookingRoutesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"

export const bookingRoutesQueryKeys = {
  all: () => ["booking-routes"],
  list: () => [...bookingRoutesQueryKeys.all(), "list"],
  details: () => [...bookingRoutesQueryKeys.all(), "detail"],
  detail: (id: string) => [...bookingRoutesQueryKeys.details(), id],
}

export const bookingRoutesQueryOptions = () =>
  queryOptions({
    queryKey: bookingRoutesQueryKeys.list(),
    queryFn: () => getBookingRoutesFn(),
  })
