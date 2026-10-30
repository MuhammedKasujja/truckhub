import { EntityId } from "@/schemas"
import { vehicleDetailsQueryOptions } from "../query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useVehicleDetailsQuery(vehicleId: EntityId) {
  const { data, isLoading, error } = useQuery(
    vehicleDetailsQueryOptions(vehicleId)
  )

  return { data: data?.data, error: error, isLoading }
}

export function useVehicleDetailsSuspenseQuery(vehicleId: EntityId) {
  const { data, isLoading, error } = useSuspenseQuery(
    vehicleDetailsQueryOptions(vehicleId)
  )

  return { data: data.data!, error, isLoading }
}
