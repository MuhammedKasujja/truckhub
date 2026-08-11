import { useQuery } from "@tanstack/react-query"
import { bookingRoutesQueryOptions } from "../query-options"

export function useBookingRoutes() {
  const { data, isLoading } = useQuery(bookingRoutesQueryOptions())
  const routes = data?.data ?? []
  return { routes, isLoading }
}