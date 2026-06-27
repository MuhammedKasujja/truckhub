import * as apiClient from "@/lib/api-client"
import {
  BatchPayload,
  BatchPricingPayload,
  DistancePricingRequest,
  LoadingOffloadingPricing,
  ListDistancePricingRequest,
  LoadingOffloadingPricingRequest,
} from "../schemas"
import { IslandPricingDto, IslandPricingResponse } from "../types"

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

export async function createBatchLoadingPricing(
  data: LoadingOffloadingPricingRequest
) {
  return await apiClient.postFn<DistancePricingRequest[]>(
    "/v1/pricing/loading-offloading",
    data.pricings
  )
}

export async function getLoadingOffloadingFrees() {
  return await apiClient.getFn<LoadingOffloadingPricing[]>(
    "/v1/pricing/loading-offloading"
  )
}

export async function getIslandsPricings() {
  return await apiClient.getFn<IslandPricingResponse[]>("/v1/pricing/islands")
}

export async function createBatchIslandPricing(data: IslandPricingDto[]) {
  return await apiClient.postFn<IslandPricingResponse[]>("/v1/pricing/islands", data)
}
