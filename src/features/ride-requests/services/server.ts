"use server"

import * as apiClient from "@/lib/api-client"
import { RideRequest, RideRequestDetails } from "@/features/ride-requests/types"
import {
  EstimateRideFareDto,
  RideRequestListSearchParams,
  RideRequestUpdateSchemaType,
  RideRequestCreateSchemaType,
} from "@/features/ride-requests/schemas"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { LocationDistanceTime } from "@/server/actions/schemas"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

const endpoint = "/v1/rides"

export async function getRideRequests(input: RideRequestListSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<RideRequest[]>(
    `${endpoint}?${params}`
  )
  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getRideRequestsByQuery({ search }: SearchQuery) {
  return getRideRequests({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getRideRequestById(bookingId: EntityId) {
  return await apiClient.getFn<RideRequest>(
    `${endpoint}/${bookingId}?view=edit`
  )
}

export async function getRideRequestDetailsById(bookingId: EntityId) {
  return await apiClient.getFn<RideRequestDetails>(
    `${endpoint}/${bookingId}?view=full`
  )
}

export async function deleteRideRequestById(bookingId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${bookingId}`)
}

export async function updateRideRequest(data: RideRequestUpdateSchemaType) {
  const { id: bookingId, ...rest } = data
  return await apiClient.putFn<RideRequest>(`${endpoint}/${bookingId}`, rest)
}

export async function createRideRequest(data: RideRequestCreateSchemaType) {
  return await apiClient.postFn<RideRequest>(endpoint, data)
}

/**
 * Get the estimated trip fare between the trip origin and destination
 * basing on the provided service
 * @param serviceId service selected
 * @param origin ride origin
 * @param destination ride destination
 * @returns
 */
export async function computeRideEsimatedFare({
  serviceId,
  origin,
  destination,
}: EstimateRideFareDto) {
  return await apiClient.postFn<LocationDistanceTime>(
    `${endpoint}/compute-fare`,
    {
      service_id: serviceId,
      origin,
      destination,
    }
  )
}

export async function getActiveRides() {
  return getRideRequests({
    page: 1,
    perPage: 30,
    sort: [],
    search: "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}
