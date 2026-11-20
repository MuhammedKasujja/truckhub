import {
  VehicleUpdateSchema,
  VehicleCreateSchema,
  VehicleSearchParamsCache,
  AssignDriverVehicleSchema,
} from "@/features/vehicles/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  getVehicleById,
  deleteVehicleById,
  vehicleAssignDriver,
  getVehicleStatistics,
  getVehicleDetailsById,
  vehicleUnAssignDriver,
} from "./server"
import { ApiError } from "@/types"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getVehiclesFn = createServerFn()
  .validator(VehicleSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getVehicles(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getVehiclesByQueryFn = createServerFn()
  .validator(VehicleSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getVehicles(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getVehicleByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleById(data.id)
  })

export const getVehicleDetailsByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const { data: vehicle, message } = await apiResponseTransform(
      getVehicleDetailsById(data.id)
    )
    return { data: vehicle!, message: message }
  })

export const deleteVehicleFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteVehicleById(data.id)
  })

export const updateVehicleFn = createServerFn()
  .validator(VehicleUpdateSchema)
  .handler(async ({ data }) => {
    return updateVehicle(data)
  })

export const createVehicleFn = createServerFn()
  .validator(VehicleCreateSchema)
  .handler(async ({ data }) => {
    return createVehicle(data)
  })

export const vehicleAssignDriverFn = createServerFn()
  .validator(AssignDriverVehicleSchema)
  .handler(async ({ data }) => {
    return vehicleAssignDriver(data)
  })

export const vehicleUnAssignDriverFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return vehicleUnAssignDriver(data.id)
  })

export const getVehicleStatisticsFn = createServerFn().handler(async () => {
  const result = await getVehicleStatistics()

  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }
  return { data: result.data! }
})
