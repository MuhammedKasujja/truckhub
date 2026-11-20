import {
  ClientUpdateSchema,
  ClientCreateSchema,
  ClientSearchParamsCache,
  ClientServiceCreateSchema,
  clientPricingSearchParams,
  ActivateClientPricingSchema,
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
  getClientInvoices,
  getClientServices,
  deleteCustomerById,
  getCustomersByQuery,
  getClientQuotations,
  createClientService,
  getClientRoutePricing,
  getCustomerDetailsById,
  getClientActiveRoutePricing,
  createClientBatchRoutePricing,
  getClientLoadingOffloadingFrees,
  createClientLoadingOffloadingPricing,
  getClientActiveLoadingOffloadingFrees,
} from "./server"
import { ApiError } from "@/types"
import {
  LoadingOffloadingPricingSchema,
  BatchPricingPayloadUpdateSchema,
} from "@/features/settings/pricing/schemas"
import { activateClientPricing } from "./pricings"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getCustomersFn = createServerFn()
  .validator(ClientSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getCustomers(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getClientsByQueryFn = createServerFn()
  .validator(SearchQuerySchema)
  .handler(async ({ data }) => {
    const response = await getCustomersByQuery(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getClientByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCustomerById(data.id)
  })

export const getClientProfileFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(getCustomerDetailsById(data.id))
  })

export const deleteClientFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteCustomerById(data.id)
  })

export const updateClientFn = createServerFn({ method: "POST" })
  .validator(ClientUpdateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(updateClient(data))
  })

export const createClientFn = createServerFn({ method: "POST" })
  .validator(ClientCreateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createClient(data))
  })

export const getClientPaymentsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientPayments(data.id)
  })

export const getClientBookingsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientBookings(data.id)
  })

export const getClientRidesFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientRides(data.id)
  })

export const getClientQuotationsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientQuotations(data.id)
  })

export const getClientInvoicesFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientInvoices(data.id)
  })

export const createClientBatchRoutePricingFn = createServerFn({ method: "POST" })
  .validator(BatchPricingPayloadUpdateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createClientBatchRoutePricing(data))
  })

export const getClientRoutePricingFn = createServerFn()
  .validator(clientPricingSearchParams)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(getClientRoutePricing(data))
    return result.data!
  })

export const getClientActiveRoutePricingFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(
      getClientActiveRoutePricing(data.id)
    )
    return result.data!
  })

export const getClientLoadingOffloadingFreesFn = createServerFn()
  .validator(clientPricingSearchParams)
  .handler(async ({ data }) => {
    return getClientLoadingOffloadingFrees(data)
  })

export const getClientActiveLoadingOffloadingFreesFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientActiveLoadingOffloadingFrees(data.id)
  })

export const createClientLoadingOffloadingPricingFn = createServerFn({ method: "POST" })
  .validator(LoadingOffloadingPricingSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createClientLoadingOffloadingPricing(data))
  })

export const changeClientTypeFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(changeClientType(data.id))
  })

export const getClientServicesFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const response = await apiResponseTransform(getClientServices(data.id))
    return response.data
  })

export const createClientServiceFn = createServerFn({ method: "POST" })
  .validator(ClientServiceCreateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createClientService(data))
  })

export const activateClientPricingFn = createServerFn({ method: "POST" })
  .validator(ActivateClientPricingSchema)
  .handler(({ data }) => apiResponseTransform(activateClientPricing(data)))
