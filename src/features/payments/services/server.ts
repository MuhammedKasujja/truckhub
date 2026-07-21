"use server"

import * as apiClient from "@/lib/api-client"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { Payment, PaymentStatistics } from "@/features/payments/types"
import {
  PaymentEditSchemaType,
  PaymentListSearchParams,
} from "@/features/payments/schemas"

export async function getPayments(input: PaymentListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Payment[]>(
    `/v1/payments?${params}`
  )

  if (response.success) {
    return  { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

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
  return await apiClient.putFn<Payment>(`/v1/payments/${serviceId}`, rest)
}

export async function createPayment(data: PaymentEditSchemaType) {
  return await apiClient.postFn<Payment>("/v1/payments", data)
}

export async function getPaymentsStatistics() {
  return await apiClient.getFn<PaymentStatistics>("/v1/payments/statistics")
}
