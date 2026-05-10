import { LocationPoint } from "@/features/ride-requests/types"
import {
  RideRequestUpdateSchemaType,
  RideRequestCreateSchemaType,
  RideRequestListSearchParams,
  RideRequestSearchParamsCache,
} from "@/features/ride-requests/schemas"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import {
  getActiveRides,
  getRideRequests,
  updateRideRequest,
  createRideRequest,
  getRideRequestById,
  deleteRideRequestById,
  getRideRequestsByQuery,
  getRideRequestDetailsById,
  computeRideRequestEsimatedFare,
} from "./data"

export const getRidesFn = createServerFn()
  .inputValidator((data) => RideRequestSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getRideRequests(data)
  })

export async function getRideRequestsByQueryFn({ search }: SearchQuery) {
  return getRideRequestsByQuery({ search })
}

export async function getRideRequestByIdFn(bookingId: EntityId) {
  return getRideRequestById(bookingId)
}

export async function getRideRequestDetailsByIdFn(bookingId: EntityId) {
  return getRideRequestDetailsById(bookingId)
}

export function deleteRideRequestByFn(bookingId: EntityId) {
  return deleteRideRequestById(bookingId)
}

export async function updateRideRequestFn(data: RideRequestUpdateSchemaType) {
  return await updateRideRequest(data)
}

export function createRideRequestFn(data: RideRequestCreateSchemaType) {
  return createRideRequest(data)
}

/**
 * Get the estimated trip fare between the trip origin and destination
 * basing on the provided service
 * @param serviceId service selected
 * @param origin booking origin
 * @param destination booking destination
 * @returns
 */
export async function computeRideRequestEsimatedFareFn({
  serviceId,
  origin,
  destination,
}: {
  serviceId: EntityId
  origin: LocationPoint
  destination: LocationPoint
}) {
  return computeRideRequestEsimatedFare({
    serviceId,
    origin,
    destination,
  })
}

export async function getActiveRidesFn() {
  return getActiveRides()
}
