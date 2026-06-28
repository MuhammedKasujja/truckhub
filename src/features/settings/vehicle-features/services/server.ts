import * as apiClient from "@/lib/api-client"
import { VehicleFeatureRequest } from "../types"

const endpoint = "v1/vehicles/features/bulk-upsert"

export async function bulkUpertVehicleFeatures(data: VehicleFeatureRequest[]) {
  return await apiClient.postFn<VehicleFeatureRequest>(endpoint, {
    features: data,
  })
}
