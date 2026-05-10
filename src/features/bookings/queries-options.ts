import { getBookingsFn } from "./services"
import { BookingListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const bookingsQueryKeys = {
  all: () => ["bookings"],
  list: () => [...bookingsQueryKeys.all(), "list"],
  details: () => [...bookingsQueryKeys.all(), "detail"],
  detail: (id: string) => [...bookingsQueryKeys.details(), id],
}

export const bookingQueryOptions = (search: BookingListSearchParams) =>
  queryOptions({
    queryKey: [...bookingsQueryKeys.list()],
    queryFn: () => getBookingsFn({ data: search }),
  })
