import * as apiClient from "@/lib/api-client"
import {
  BatchPayload,
  BatchPricingPayload,
  BatchPricingPayloadCreate,
} from "../schemas"

const endpoint = "/v1/routes/pricing"

export async function updateBatchRouteTonnagePricing(
  data: BatchPricingPayload
) {
  const { clientId, ...rest } = data
  return await apiClient.putFn<BatchPayload>(`${endpoint}/${clientId}`, rest)
}

export async function createBatchRouteTonnagePricing(
  data: BatchPricingPayload
) {
  return await apiClient.postFn<BatchPayload>(endpoint, data)
}
