import {
  DriverUpdateSchema,
  DriverCreateSchema,
  DriverSearchParamsCache,
  recordTestResultSchema,
  LicenseChangeRequestSchema,
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
  recordDriverTest,
  changeDriverLicense,
} from "./server"
import { ApiError } from "@/types"
import { driverRequestInput } from "../driver-form-data"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getDriversFn = createServerFn()
  .validator(DriverSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getDrivers(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getDriversByQueryFn = createServerFn()
  .validator(SearchQuerySchema)
  .handler(async ({ data }) => {
    const response = await getDriversByQuery(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return response.data
  })

export const getDriverByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getDriverById(data.id)
  })

export const getDriverProfileFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(getDriverDetailsById(data.id))
  })

export const deleteDriverFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteDriverById(data.id)
  })

export const updateDriverFn = createServerFn({ method: "POST" })
  .validator(driverRequestInput(DriverUpdateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(updateDriver(data))
  })

export const createDriverFn = createServerFn({ method: "POST" })
  .validator(driverRequestInput(DriverCreateSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(createDriver(data))
  })

export const recordDriverTestFn = createServerFn({ method: "POST" })
  .validator(recordTestResultSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(recordDriverTest(data))
  })

export const changeDriverLicenseFn = createServerFn({ method: "POST" })
  .validator(driverRequestInput(LicenseChangeRequestSchema))
  .handler(async ({ data }) => {
    return apiResponseTransform(changeDriverLicense(data))
  })
