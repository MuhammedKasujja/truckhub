import { BookingListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getBookingsFn,
  getBookingDetailsFn,
  getBookingsByQueryFn,
  getBookingStatisticsFn,
} from "./services"
import { SearchQuery } from "@/types"

export const bookingsQueryKeys = {
  all: () => ["bookings"],
  list: () => [...bookingsQueryKeys.all(), "list"],
  details: () => [...bookingsQueryKeys.all(), "detail"],
  statistics: () => [...bookingsQueryKeys.all(), "statistics"],
  search: (search?: string) => [...bookingsQueryKeys.all(), "search", search],
  detail: (id: string) => [...bookingsQueryKeys.details(), id],
}

export const createBookingQueryOptions = (search: BookingListSearchParams) => {
  return queryOptions({
    queryKey: [...bookingsQueryKeys.list(), search],
    queryFn: () => getBookingsFn({ data: search }),
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

export const bookingsListSearchQueryOptions = ({ search }: SearchQuery) =>
  queryOptions({
    queryKey: bookingsQueryKeys.search(search),
    queryFn: () => getBookingsByQueryFn({ data: { search } }),
  })
