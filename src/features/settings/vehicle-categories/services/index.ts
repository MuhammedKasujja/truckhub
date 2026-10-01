import {
  VehicleCategoryUpdateSchema,
  VehicleCategoryCreateSchema,
  VehicleCategorySearchParamsCache,
} from "@/features/settings/vehicle-categories/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getVehicleCategorys,
  createVehicleCategory,
  updateVehicleCategory,
  getVehicleCategoryById,
  deleteVehicleCategoryById,
} from "./server"

export const getVehicleCategorysFn = createServerFn()
  .inputValidator(VehicleCategorySearchParamsCache)
  .handler(async ({ data }) => {
    return await getVehicleCategorys(data)
  })

export const getVehicleCategoryFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleCategoryById(data.id)
  })

export const deleteVehicleCategoryFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteVehicleCategoryById(data.id)
  })

export const updateVehicleCategoryFn = createServerFn()
  .inputValidator(VehicleCategoryUpdateSchema)
  .handler(async ({ data }) => {
    return updateVehicleCategory(data)
  })

export const createVehicleCategoryFn = createServerFn()
  .inputValidator(VehicleCategoryCreateSchema)
  .handler(async ({ data }) => {
    return createVehicleCategory(data)
  })
