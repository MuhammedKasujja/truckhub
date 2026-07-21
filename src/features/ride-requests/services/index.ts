import {
  EstimateRideFareSchema,
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
  computeRideEsimatedFare,
  getRideRequestDetailsById,
} from "./server"
import { ApiError } from "@/types"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"

export const getRidesFn = createServerFn()
  .inputValidator(RideRequestSearchParamsCache)
  .handler(async ({ data }) => {
    const { error, data: rides, pagination } = await getRideRequests(data)
    if (error) {
      const { message, erroCode, statusCode } = error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: rides, pagination: pagination }
  })

export const getRideRequestsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    const response = await getRideRequestsByQuery(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return response.data
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

export const createRideFn = createServerFn()
  .inputValidator(RideRequestCreateSchema)
  .handler(async ({ data }) => {
    return createRideRequest(data)
  })

export const computeRideEsimatedFareFn = createServerFn()
  .inputValidator(EstimateRideFareSchema)
  .handler(async ({ data }) => {
    return computeRideEsimatedFare(data)
  })

export const getActiveRidesFn = createServerFn().handler(async () => {
  return getActiveRides()
})
