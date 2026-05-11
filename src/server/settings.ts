import * as apiClient from "@/lib/api-client"
import { createServerFn } from "@tanstack/react-start"
import { Setting, VehicleConfigurations } from "@/types/setting"

export const getSettings = createServerFn().handler(async () => {
  return await apiClient.getFn<Setting>("/v1/settings")
})

export const getVehicleSettings = createServerFn().handler(async () => {
  return await apiClient.getFn<VehicleConfigurations>(
    "/v1/settings/vehicle-config"
  )
})
