import {
  VehicleUpdateSchema,
  VehicleCreateSchema,
  VehicleSearchParamsCache,
  AssignDriverVehicleSchema,
} from "@/features/vehicles/schemas"
import { createServerFn } from "@tanstack/react-start"
import { SearchQuerySchema, EntityIdSchema } from "@/schemas"
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  getVehicleById,
  deleteVehicleById,
  getVehiclesByQuery,
  vehicleAssignDriver,
  getVehicleDetailsById,
} from "./server"

export const getVehiclesFn = createServerFn()
  .inputValidator(VehicleSearchParamsCache)
  .handler(async ({ data }) => {
    return await getVehicles(data)
  })

export const getVehiclesByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getVehiclesByQuery(data)
  })

export const getVehicleByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleById(data.id)
  })

export const getVehicleDetailsByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleDetailsById(data.id)
  })

export const deleteVehicleFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteVehicleById(data.id)
  })

export const updateVehicleFn = createServerFn()
  .inputValidator(VehicleUpdateSchema)
  .handler(async ({ data }) => {
    return updateVehicle(data)
  })

export const createVehicleFn = createServerFn()
  .inputValidator(VehicleCreateSchema)
  .handler(async ({ data }) => {
    return createVehicle(data)
  })

export const vehicleAssignDriverFn = createServerFn()
  .inputValidator(AssignDriverVehicleSchema)
  .handler(async ({ data }) => {
    return vehicleAssignDriver(data)
  })
