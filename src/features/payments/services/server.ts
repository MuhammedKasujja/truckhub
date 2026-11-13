import { format } from "date-fns"
import * as apiClient from "@/lib/api-client"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { Payment, PaymentStatistics } from "@/features/payments/types"
import {
  PaymentRequestInput,
  ReversePaymentInput,
  PaymentListSearchParams,
} from "@/features/payments/schemas"

const API_DATE_FORMAT = "yyyy-MM-dd"

// The URL keeps the paid date range as ms timestamps (dateRange filter);
// the API expects calendar dates. Local time keeps the picked day intact.
const toApiDate = (ms?: number | null) =>
  ms != null ? format(ms, API_DATE_FORMAT) : undefined

export async function getPayments(input: PaymentListSearchParams) {
  const { date, ...rest } = input
  const params = generateApiSearchParams({
    ...rest,
    dateFrom: toApiDate(date?.[0]),
    dateTo: toApiDate(date?.[1]),
  })
  const response = await apiClient.getPaginatedFn<Payment[]>(
    `/v1/billing/payments?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getPaymentsByQuery(query: SearchQuery) {
  const params = generateApiSearchParams(query)

  const { data, isSuccess, error } = await apiClient.getFn<Payment[]>(
    `/v1/billing/payments?${params}`
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

export async function reversePayment(data: ReversePaymentInput) {
  const { paymentId, reason } = data
  return await apiClient.postFn<Payment>(
    `/v1/billing/payments/${paymentId}/reverse`,
    { reason }
  )
}
