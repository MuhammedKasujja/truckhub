import { queryOptions } from "@tanstack/react-query"

export const bookingKeys = {
  all: () => ["bookings"],
  list: () => [...bookingKeys.all(), "list"],
  details: () => [...bookingKeys.all(), "detail"],
  detail: (id: string) => [...bookingKeys.details(), id],
}

export const bookingQueryOptions = () =>
  queryOptions({
    queryKey: bookingKeys.list(),
  })
