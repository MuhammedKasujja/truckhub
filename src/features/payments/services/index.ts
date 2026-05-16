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
  EditPaymentSchema,
  PaymentSearchParamsCache,
} from "@/features/payments/schemas"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"

export const getPaymentsFn = createServerFn()
  .inputValidator(PaymentSearchParamsCache)
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
  .inputValidator(EditPaymentSchema)
  .handler(async ({ data }) => {
    return updatePayment(data)
  })

export const createPaymentFn = createServerFn()
  .inputValidator(EditPaymentSchema.omit({ id: true }))
  .handler(async ({ data }) => {
    return createPayment(data)
  })

export const getPaymentsStatisticsFn = createServerFn().handler(async () => {
  return getPaymentsStatistics()
})
