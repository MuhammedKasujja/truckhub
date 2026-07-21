import {
  VehicleTypeUpdateSchema,
  VehicleTypeCreateSchema,
  VehicleTypeSearchParamsCache,
} from "@/features/settings/vehicle-types/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getVehicleTypes,
  createVehicleType,
  updateVehicleType,
  getVehicleTypeById,
  deleteVehicleTypeById,
} from "./server"

export const getVehicleTypesFn = createServerFn()
  .inputValidator(VehicleTypeSearchParamsCache)
  .handler(async ({ data }) => {
    return await getVehicleTypes(data)
  })

export const getVehicleTypeFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleTypeById(data.id)
  })

export const deleteVehicleTypeFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteVehicleTypeById(data.id)
  })

export const updateVehicleTypeFn = createServerFn()
  .inputValidator(VehicleTypeUpdateSchema)
  .handler(async ({ data }) => {
    return updateVehicleType(data)
  })

export const createVehicleTypeFn = createServerFn()
  .inputValidator(VehicleTypeCreateSchema)
  .handler(async ({ data }) => {
    return createVehicleType(data)
  })
