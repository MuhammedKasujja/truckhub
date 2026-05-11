import { BookingListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getBookingsFn, getBookingStatisticsFn } from "./services"

export const bookingsQueryKeys = {
  all: () => ["bookings"],
  list: () => [...bookingsQueryKeys.all(), "list"],
  details: () => [...bookingsQueryKeys.all(), "detail"],
  statistics: () => [...bookingsQueryKeys.all(), "statistics"],
  detail: (id: string) => [...bookingsQueryKeys.details(), id],
}

export const createBookingQueryOptions = (search: BookingListSearchParams) =>
  queryOptions({
    queryKey: [...bookingsQueryKeys.list(), search],
    queryFn: () => getBookingsFn({ data: search }),
  })

export const createBookingStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: bookingsQueryKeys.statistics(),
    queryFn: () => getBookingStatisticsFn(),
  })
