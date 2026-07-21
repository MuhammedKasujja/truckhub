import {
  DriverUpdateSchema,
  DriverCreateSchema,
  DriverSearchParamsCache,
} from "@/features/drivers/schemas"
import { createServerFn } from "@tanstack/react-start"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import {
  getDrivers,
  updateDriver,
  createDriver,
  getDriverById,
  deleteDriverById,
  getDriversByQuery,
  getDriverDetailsById,
} from "./server"
import { ApiError } from "@/types"

export const getDriversFn = createServerFn()
  .inputValidator(DriverSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getDrivers(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getDriversByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    const response = await getDriversByQuery(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return response.data
  })

export const getDriverByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getDriverById(data.id)
  })

export const getDriverProfileFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getDriverDetailsById(data.id)
  })

export const deleteDriverFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteDriverById(data.id)
  })

export const updateDriverFn = createServerFn()
  .inputValidator(DriverUpdateSchema)
  .handler(async ({ data }) => {
    return updateDriver(data)
  })

export const createDriverFn = createServerFn()
  .inputValidator(DriverCreateSchema)
  .handler(async ({ data }) => {
    return createDriver(data)
  })
