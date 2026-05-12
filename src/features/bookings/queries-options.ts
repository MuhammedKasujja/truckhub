import { queryOptions } from "@tanstack/react-query"
import { BookingSearchParamsCache } from "./schemas"
import {
  getBookingsFn,
  getBookingDetailsFn,
  getBookingStatisticsFn,
} from "./services"
import { generatePageSearchParams } from "@/lib/search-params"

export const bookingsQueryKeys = {
  all: () => ["bookings"],
  list: () => [...bookingsQueryKeys.all(), "list"],
  details: () => [...bookingsQueryKeys.all(), "detail"],
  statistics: () => [...bookingsQueryKeys.all(), "statistics"],
  detail: (id: string) => [...bookingsQueryKeys.details(), id],
}

export const createBookingQueryOptions = (
  search: Record<string, string | string[] | undefined> = {}
) => {
  const searchParams = generatePageSearchParams(
    search,
    BookingSearchParamsCache
  )
  return queryOptions({
    queryKey: [...bookingsQueryKeys.list(), searchParams],
    queryFn: () => getBookingsFn({ data: searchParams }),
  })
}

export const createBookingStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: bookingsQueryKeys.statistics(),
    queryFn: () => getBookingStatisticsFn(),
  })

export const bookingDetailsQueryOptions = (bookingId: string) =>
  queryOptions({
    queryKey: bookingsQueryKeys.detail(bookingId),
    queryFn: () => getBookingDetailsFn({ data: { id: bookingId } }),
  })
