import { LocationPoint } from "@/features/ride-requests/types"
import {
  RideRequestUpdateSchema,
  RideRequestCreateSchema,
  RideRequestSearchParamsCache,
} from "@/features/ride-requests/schemas"
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
} from "./server"
import { EntityIdSchema, SearchQuerySchema, EntityId } from "@/schemas"

export const getRidesFn = createServerFn()
  .inputValidator((data) => RideRequestSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getRideRequests(data)
  })

export const getRideRequestsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getRideRequestsByQuery(data)
  })

export const getRideRequestByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getRideRequestById(data.id)
  })

export const getRideDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getRideRequestDetailsById(data.id)
  })

export const deleteRideFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteRideRequestById(data.id)
  })

export const updateRideFn = createServerFn()
  .inputValidator(RideRequestUpdateSchema)
  .handler(async ({ data }) => {
    return updateRideRequest(data)
  })

export const createRideRequestFn = createServerFn()
  .inputValidator(RideRequestCreateSchema)
  .handler(async ({ data }) => {
    return createRideRequest(data)
  })

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

export const getActiveRidesFn = createServerFn().handler(async () => {
  return getActiveRides()
})
