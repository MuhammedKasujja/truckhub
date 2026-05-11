import {
  CarBrandUpdateSchema,
  CarBrandCreateSchema,
  CarBrandSearchParamsCache,
} from "@/features/settings/car-brand/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getCarBrands,
  createCarBrand,
  updateCarBrand,
  getCarBrandById,
  deleteCarBrandById,
} from "./server"

export const getCarBrandsFn = createServerFn()
  .inputValidator((data) => CarBrandSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getCarBrands(data)
  })

export const getCarBrandFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCarBrandById(data.id)
  })

export const deleteCarBrandFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteCarBrandById(data.id)
  })

export const updateCarBrandFn = createServerFn()
  .inputValidator(CarBrandUpdateSchema)
  .handler(async ({ data }) => {
    return updateCarBrand(data)
  })

export const createCarBrandFn = createServerFn()
  .inputValidator(CarBrandCreateSchema)
  .handler(async ({ data }) => {
    return createCarBrand(data)
  })
