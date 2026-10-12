import * as apiClient from "@/lib/api-client"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { Payment, PaymentStatistics } from "@/features/payments/types"
import {
  PaymentRequestInput,
  PaymentListSearchParams,
} from "@/features/payments/schemas"

export async function getPayments(input: PaymentListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Payment[]>(
    `/v1/billing/invoice-payments?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getPaymentsByQuery(query: SearchQuery) {
  const params = generateApiSearchParams(query)

  const { data, isSuccess, error } = await apiClient.getFn<Payment[]>(
    `/v1/billing/invoice-payments?${params}`
  )
  return { data: isSuccess ? data! : [], error }
}

export async function getPaymentById(paymentId: EntityId) {
  return await apiClient.getFn<Payment>(`/v1/payments/${paymentId}`)
}

export async function deletePaymentById(paymentId: EntityId) {
  return await apiClient.deleteFn(`/v1/payments/${paymentId}`)
}

export async function createPayment(data: PaymentRequestInput) {
  const payload = {
    client_id: data.clientId,
    amount: data.amount,
    method: data.paymentMethod,
    transaction_ref: data.transactionRef,
    // paid_at: "2026-10-12T13:23:12.381Z",
    targets: [
      {
        kind: "invoice",
        target_id: data.entityId,
        amount: data.amount,
      },
    ],
    auto_allocate: true,
  }
  return await apiClient.postFn<Payment>("/v1/billing/payments", payload, {
    headers: { "Idempotency-Key": data.idempotencyKey },
  })
}

export async function getPaymentsStatistics() {
  return await apiClient.getFn<PaymentStatistics>("/v1/payments/statistics")
}
