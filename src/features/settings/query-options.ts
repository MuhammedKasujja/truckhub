import { queryOptions } from "@tanstack/react-query"
import { getSettingsFn, getVehicleSettingsFn } from "./service"

export const settingsQueryKeys = {
  all: () => ["settings"] as const,
  list: () => [...settingsQueryKeys.all(), "list"] as const,
  vehicles: () => [...settingsQueryKeys.all(), "vehicles-config"] as const,
} as const

export const createSettingsQueryOptions = () =>
  queryOptions({
    queryKey: settingsQueryKeys.list(),
    queryFn: getSettingsFn,
  })

export const createVehicleConfigurationsQueryOptions = () =>
  queryOptions({
    queryKey: settingsQueryKeys.vehicles(),
    queryFn: getVehicleSettingsFn,
  })
