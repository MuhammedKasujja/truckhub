import * as apiClient from "@/lib/api-client"
import {
  BatchPayload,
  BatchPricingPayload,
  PricingSearchParams,
  DistancePricingRequest,
  ListDistancePricingRequest,
  LoadingOffloadingPricingRequest,
} from "../schemas"
import {
  CompanyPricingDates,
  RoutePricingResponse,
  IslandPricingResponse,
  IslandPricingCreateDto,
  DistanceTonnagePricingResponse,
  LoadingOffloadingPricingResponse,
} from "../types"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "/v1/pricing/routes"

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

export async function getDistanceTonnagePricing(search: PricingSearchParams) {
  const params = generateApiSearchParams({
    reference_date: search.referenceDate,
  })
  const url = "/v1/pricing/distance-tonnage"
  const modified = params ? `${url}?${params}` : url
  return await apiClient.getFn<DistanceTonnagePricingResponse>(modified)
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

export async function getLoadingOffloadingFrees(search: PricingSearchParams) {
  const params = generateApiSearchParams({
    reference_date: search.referenceDate,
  })
  const url = "/v1/pricing/loading-offloading"
  const modified = params ? `${url}?${params}` : url
  return await apiClient.getFn<LoadingOffloadingPricingResponse>(modified)
}

export async function getIslandsPricings(search: PricingSearchParams) {
  const params = generateApiSearchParams({
    reference_date: search.referenceDate,
  })
  const url = "/v1/pricing/islands"
  const modified = params ? `${url}?${params}` : url
  return await apiClient.getFn<IslandPricingResponse>(modified)
}

export async function createBatchIslandPricing(data: IslandPricingCreateDto) {
  return await apiClient.postFn<IslandPricingResponse[]>(
    "/v1/pricing/islands",
    data
  )
}

export async function getRouteTonnagePricing(search: PricingSearchParams) {
  const params = generateApiSearchParams({
    reference_date: search.referenceDate,
  })
  const url = params ? `${endpoint}?${params}` : endpoint
  return await apiClient.getFn<RoutePricingResponse>(url)
}

export async function getCompanyPricingDates() {
  return await apiClient.getFn<CompanyPricingDates>("/v1/pricing/dates")
}
