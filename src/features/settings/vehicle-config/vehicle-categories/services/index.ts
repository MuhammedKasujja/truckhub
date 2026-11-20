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
  .validator(VehicleCategorySearchParamsCache)
  .handler(async ({ data }) => {
    return await getVehicleCategorys(data)
  })

export const getVehicleCategoryFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getVehicleCategoryById(data.id)
  })

export const deleteVehicleCategoryFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteVehicleCategoryById(data.id)
  })

export const updateVehicleCategoryFn = createServerFn({ method: "POST" })
  .validator(formInput(VehicleCategoryUpdateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(updateVehicleCategory(data))
  })

export const createVehicleCategoryFn = createServerFn({ method: "POST" })
  .validator(formInput(VehicleCategoryCreateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(createVehicleCategory(data))
  })
