import * as apiClient from "@/lib/api-client";
import { Setting, VehicleConfigurations } from "@/types/setting";

export async function getSettings() {
  return await apiClient.getFn<Setting>("/v1/settings");
}

export async function getVehicleSettings() {
  return await apiClient.getFn<VehicleConfigurations>(
    "/v1/settings/vehicle-config",
  );
}
