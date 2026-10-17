import {
  VehicleCategoryUpdateSchema,
  VehicleCategoryCreateSchema,
  VehicleCategorySearchParamsCache,
} from "@/features/settings/vehicle-config/vehicle-categories/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getVehicleCategorys,
  createVehicleCategory,
  updateVehicleCategory,
  getVehicleCategoryById,
  deleteVehicleCategoryById,
} from "./server"
import { formInput } from "@/lib/form-utils"
import { apiResponseTransform } from "@/lib/api-response-serializer"

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

export const updateVehicleCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(formInput(VehicleCategoryUpdateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(updateVehicleCategory(data))
  })

export const createVehicleCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(formInput(VehicleCategoryCreateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(createVehicleCategory(data))
  })
