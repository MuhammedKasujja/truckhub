import { EntityId } from "@/schemas"
import { vehicleDetailsQueryOptions } from "../query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useVehicleDetailsQuery(vehicleId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery(vehicleDetailsQueryOptions(vehicleId))

  return { data: response?.data, error: error, isLoading }
}
export function useVehicleDetailsSuspenseQuery(vehicleId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useSuspenseQuery(vehicleDetailsQueryOptions(vehicleId))

  return { data: response.data!, error, isLoading }
}
