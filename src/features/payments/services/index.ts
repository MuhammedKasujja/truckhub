import { createServerFn } from "@tanstack/react-start"
import {
  getPayments,
  createPayment,
  getPaymentById,
  reversePayment,
  deletePaymentById,
  getPaymentsByQuery,
  getPaymentsStatistics,
} from "./server"
import {
  paymentRequestSchema,
  reversePaymentSchema,
  PaymentSearchParamsCache,
} from "@/features/payments/schemas"
import { ApiError } from "@/types"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getPaymentsFn = createServerFn()
  .inputValidator(PaymentSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getPayments(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getPaymentsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getPaymentsByQuery(data)
  })

export const getPaymentDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getPaymentById(data.id)
  })

export const deletePaymentFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deletePaymentById(data.id)
  })

export const createPaymentFn = createServerFn()
  .inputValidator(paymentRequestSchema)
  .handler(async ({ data }) => {
    return createPayment(data)
  })

export const getPaymentsStatisticsFn = createServerFn().handler(async () => {
  return getPaymentsStatistics()
})

export const reversePaymentFn = createServerFn()
  .inputValidator(reversePaymentSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(reversePayment(data))
  })
