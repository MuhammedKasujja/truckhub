import * as apiClient from "@/lib/api-client"
import {
  BatchPayload,
  BatchPricingPayload,
  DistancePricingRequest,
  ListDistancePricingRequest,
} from "../schemas"

const endpoint = "/v1/routes/pricing"

export async function updateBatchRouteTonnagePricing(
  data: BatchPricingPayload
) {
  const { client_id, ...rest } = data
  return await apiClient.putFn<BatchPayload>(`${endpoint}/${client_id}`, rest)
}

export async function createBatchRouteTonnagePricing(
  data: BatchPricingPayload
) {
  return await apiClient.postFn<BatchPayload>(endpoint, data)
}

export async function createBatchDistancePricing(
  data: ListDistancePricingRequest
) {
  return await apiClient.postFn<BatchPayload>(
    "/v1/pricing/distance-tonnage",
    data.pricings
  )
}
export async function getDistanceTonnagePricing() {
  return await apiClient.getFn<DistancePricingRequest[]>(
    "/v1/pricing/distance-tonnage"
  )
}
