import {
  ClientUpdateSchema,
  ClientCreateSchema,
  ClientSearchParamsCache,
} from "@/features/clients/schemas"
import { createServerFn } from "@tanstack/react-start"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import {
  getCustomers,
  createClient,
  updateClient,
  getClientRides,
  getCustomerById,
  changeClientType,
  getClientBookings,
  getClientPayments,
  deleteCustomerById,
  getCustomersByQuery,
  getClientRoutePricing,
  getCustomerDetailsById,
  createClientBatchRoutePricing,
  getClientLoadingOffloadingFrees,
  createClientLoadingOffloadingPricing,
} from "./server"
import { ApiError } from "@/types"
import {
  LoadingOffloadingPricingSchema,
  BatchPricingPayloadUpdateSchema,
} from "@/features/settings/pricing/schemas"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getCustomersFn = createServerFn()
  .inputValidator(ClientSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getCustomers(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getClientsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    const response = await getCustomersByQuery(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return response.data
  })

export const getClientByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCustomerById(data.id)
  })

export const getClientProfileFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCustomerDetailsById(data.id)
  })

export const deleteClientFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteCustomerById(data.id)
  })

export const updateClientFn = createServerFn({ method: "POST" })
  .inputValidator(ClientUpdateSchema)
  .handler(async ({ data }) => {
    return updateClient(data)
  })

export const createClientFn = createServerFn({ method: "POST" })
  .inputValidator(ClientCreateSchema)
  .handler(async ({ data }) => {
    return createClient(data)
  })

export const getClientPaymentsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientPayments(data.id)
  })

export const getClientBookingsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientBookings(data.id)
  })

export const getClientRidesFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientRides(data.id)
  })

export const createClientBatchRoutePricingFn = createServerFn()
  .inputValidator(BatchPricingPayloadUpdateSchema)
  .handler(async ({ data }) => {
    return createClientBatchRoutePricing(data)
  })

export const getClientRoutePricingFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientRoutePricing(data.id)
  })

export const getClientLoadingOffloadingFreesFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientLoadingOffloadingFrees(data.id)
  })

export const createClientLoadingOffloadingPricingFn = createServerFn()
  .inputValidator(LoadingOffloadingPricingSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createClientLoadingOffloadingPricing(data))
  })

export const changeClientTypeFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await changeClientType(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })
