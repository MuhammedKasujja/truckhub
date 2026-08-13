import { queryOptions } from "@tanstack/react-query"
import { getSettingsFn, getVehicleSettingsFn } from "./service"

export const settingsQueryKeys = {
  all: () => ["settings"] as const,
  list: () => [...settingsQueryKeys.all(), "list"] as const,
  vehiclesConfig: () => [...settingsQueryKeys.all(), "vehicles-config"] as const,
} as const

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: settingsQueryKeys.list(),
    queryFn: getSettingsFn,
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  })

export const createVehicleConfigurationsQueryOptions = () =>
  queryOptions({
    queryKey: settingsQueryKeys.vehiclesConfig(),
    queryFn: getVehicleSettingsFn,
  })
