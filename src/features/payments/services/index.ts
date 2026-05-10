import { getPayments } from "./data"
import * as apiClient from "@/lib/api-client"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { generateApiSearchParams } from "@/lib/search-params"
import { Payment, PaymentStatistics } from "@/features/payments/types"
import {
  PaymentEditSchemaType,
  PaymentSearchParamsCache,
} from "@/features/payments/schemas"

export const getPaymentsFn = createServerFn()
  .inputValidator((data) => PaymentSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getPayments(data)
  })

export async function getPaymentsByQuery(query: SearchQuery) {
  const params = generateApiSearchParams(query)

  const { data, isSuccess, error } = await apiClient.getFn<Payment[]>(
    `/v1/payments?${params}`
  )
  return { data: isSuccess ? data! : [], error }
}

export async function getPaymentById(paymentId: EntityId) {
  return await apiClient.getFn<Payment>(`/v1/payments/${paymentId}`)
}

export async function deletePaymentById(paymentId: EntityId) {
  return await apiClient.deleteFn(`/v1/payments/${paymentId}`)
}

export async function updatePayment(data: PaymentEditSchemaType) {
  const { id: serviceId, ...rest } = data
  return await apiClient.putFn(`/v1/payments/${serviceId}`, rest)
}

export async function createPayment(data: PaymentEditSchemaType) {
  return await apiClient.postFn("/v1/payments", data)
}

export async function getPaymentsStatistics() {
  return await apiClient.getFn<PaymentStatistics>("/v1/payments/statistics")
}
