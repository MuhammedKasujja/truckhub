import { queryOptions } from "@tanstack/react-query"
import { BookingSearchParamsSchema } from "./schemas"
import {
  getBookingsFn,
  getBookingDetailsFn,
  getBookingStatisticsFn,
} from "./services"
import {
  generateApiSearchParams,
  generatePageSearchParams,
} from "@/lib/search-params"

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
    BookingSearchParamsSchema
  )
  const params = generateApiSearchParams(searchParams)
  return queryOptions({
    queryKey: [...bookingsQueryKeys.list(), params],
    queryFn: () => getBookingsFn({ data: searchParams }),
  })
}

export const createBookingStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: bookingsQueryKeys.statistics(),
    queryFn: () => getBookingStatisticsFn(),
    // staleTime: Infinity, // Never refetch unless invalidated
    // gcTime: Infinity, // Keep in cache forever
    // retry: false,
  })

export const bookingDetailsQueryOptions = (bookingId: string) =>
  queryOptions({
    queryKey: bookingsQueryKeys.detail(bookingId),
    queryFn: () => getBookingDetailsFn({ data: { id: bookingId } }),
  })
