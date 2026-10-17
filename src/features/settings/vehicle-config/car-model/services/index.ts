import {
  CarModelCreateSchema,
  CarModelUpdateSchema,
  CarModelSearchParamsCache,
} from "@/features/settings/vehicle-config/car-model/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getCarModels,
  createCarModel,
  updateCarModel,
  getCarModelById,
  deleteCarModelById,
} from "./server"
import { formInput } from "@/lib/form-utils"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getCarModelsFn = createServerFn()
  .inputValidator(CarModelSearchParamsCache)
  .handler(async ({ data }) => {
    return await getCarModels(data)
  })

export const getCarModelFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCarModelById(data.id)
  })

export const deleteCarModelFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteCarModelById(data.id)
  })

export const updateCarModelFn = createServerFn()
  .inputValidator(formInput(CarModelUpdateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(updateCarModel(data))
  })

export const createCarModelFn = createServerFn()
  .inputValidator(formInput(CarModelCreateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(createCarModel(data))
  })
