import { EntityId } from "@/schemas"
import { driverProfileQueryOptions } from "../queries"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useDriverProfileQuery(driverId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery(driverProfileQueryOptions(driverId))

  return { data: response?.data, error: error, isLoading }
}
export function useDriverProfileSuspenseQuery(driverId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useSuspenseQuery(driverProfileQueryOptions(driverId))

  return { data: response.data!, error, isLoading }
}
