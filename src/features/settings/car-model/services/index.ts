import {
  CarModelCreateSchema,
  CarModelUpdateSchema,
  CarModelSearchParamsCache,
} from "@/features/settings/car-model/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getCarModels,
  createCarModel,
  updateCarModel,
  getCarModelById,
  deleteCarModelById,
} from "./server"

export const getCarModelsFn = createServerFn()
  .inputValidator((data) => CarModelSearchParamsCache.parse(data))
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
  .inputValidator(CarModelUpdateSchema)
  .handler(async ({ data }) => {
    return updateCarModel(data)
  })

export const createCarModelFn = createServerFn()
  .inputValidator(CarModelCreateSchema)
  .handler(async ({ data }) => {
    return createCarModel(data)
  })
