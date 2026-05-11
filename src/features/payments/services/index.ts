import { createServerFn } from "@tanstack/react-start"
import {
  getPayments,
  updatePayment,
  createPayment,
  getPaymentById,
  deletePaymentById,
  getPaymentsByQuery,
  getPaymentsStatistics,
} from "./server"
import {
  createEditPaymentSchema,
  PaymentSearchParamsCache,
} from "@/features/payments/schemas"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"

export const getPaymentsFn = createServerFn()
  .inputValidator((data) => PaymentSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getPayments(data)
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

export const updatePaymentFn = createServerFn()
  .inputValidator(createEditPaymentSchema())
  .handler(async ({ data }) => {
    return updatePayment(data)
  })

export const createPaymentFn = createServerFn()
  .inputValidator(createEditPaymentSchema())
  .handler(async ({ data }) => {
    return createPayment(data)
  })

export const getPaymentsStatisticsFn = createServerFn().handler(async () => {
  return getPaymentsStatistics()
})
