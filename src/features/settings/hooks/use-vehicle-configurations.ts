import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createVehicleConfigurationsQueryOptions } from "@/features/settings/query-options"

export function useVehicleConfigurations() {
  const {
    data: { data },
    isLoading,
  } = useSuspenseQuery(createVehicleConfigurationsQueryOptions())

  return { data, isLoading }
}

export function useVehicleConfigurationsQuery() {
  const { data, isLoading } = useQuery(
    createVehicleConfigurationsQueryOptions()
  )

  return { data: data?.data, isLoading }
}

export function useVehicleConfigurationsSuspense() {
  const {
    data: { data },
    isLoading,
  } = useSuspenseQuery(createVehicleConfigurationsQueryOptions())

  return { data, isLoading }
}
