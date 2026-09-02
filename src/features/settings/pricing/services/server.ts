import * as apiClient from "@/lib/api-client"
import {
  BatchPayload,
  BatchPricingPayload,
  DistancePricingRequest,
  ListDistancePricingRequest,
  LoadingOffloadingPricingRequest,
} from "../schemas"
import {
  RoutePricingResponse,
  IslandPricingResponse,
  IslandPricingCreateDto,
  DistanceTonnagePricingResponse,
  LoadingOffloadingPricingResponse,
} from "../types"

const endpoint = "/v1/pricing/routes "

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
  const { pricings, effectiveDate: valid_from } = data
  return await apiClient.postFn<BatchPayload>("/v1/pricing/distance-tonnage", {
    valid_from,
    pricings,
  })
}

export async function getDistanceTonnagePricing() {
  return await apiClient.getFn<DistanceTonnagePricingResponse>(
    "/v1/pricing/distance-tonnage"
  )
}

export async function createBatchLoadingPricing(
  data: LoadingOffloadingPricingRequest
) {
  const { pricings, effective_date } = data
  return await apiClient.postFn<DistancePricingRequest[]>(
    "/v1/pricing/loading-offloading",
    { pricings, valid_from: effective_date }
  )
}

export async function getLoadingOffloadingFrees() {
  return await apiClient.getFn<LoadingOffloadingPricingResponse>(
    "/v1/pricing/loading-offloading"
  )
}

export async function getIslandsPricings() {
  return await apiClient.getFn<IslandPricingResponse>("/v1/pricing/islands")
}

export async function createBatchIslandPricing(data: IslandPricingCreateDto) {
  return await apiClient.postFn<IslandPricingResponse[]>(
    "/v1/pricing/islands",
    data
  )
}

export async function getRouteTonnagePricing() {
  return await apiClient.getFn<RoutePricingResponse>(`${endpoint}/view`)
}
