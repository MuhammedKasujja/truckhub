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
import { formInput } from "@/lib/form-utils"
import { apiResponseTransform } from "@/lib/api-response-serializer"

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
    return apiResponseTransform(getDriverDetailsById(data.id))
  })

export const deleteDriverFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteDriverById(data.id)
  })

export const updateDriverFn = createServerFn({ method: "POST" })
  .inputValidator(formInput(DriverUpdateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(updateDriver(data))
  })

export const createDriverFn = createServerFn({ method: "POST" })
  .inputValidator(formInput(DriverCreateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(createDriver(data))
  })
