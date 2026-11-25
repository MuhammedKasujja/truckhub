import { api } from "@/lib/api"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"
import { Invoice, InvoiceActivity, InvoiceStatistics } from "../types"
import {
  VoidInvoiceInput,
  InvoiceCreateInput,
  InvoiceListSearchParams,
} from "../schemas"

const endpoint = "/v1/invoices"

export async function getInvoices(input: InvoiceListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Invoice[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getInvoiceDetails(invoiceId: EntityId) {
  return await apiClient.getFn<Invoice>(`${endpoint}/${invoiceId}`)
}

export async function createInvoice(data: InvoiceCreateInput) {
  return await apiClient.postFn<Invoice>(endpoint, {
    quotation_id: data.quotationId,
    unit_ids: data.unitIds,
    due_date: data.dueDate,
  })
}

export async function getInvoicePdf(invoiceId: EntityId) {
  return await api.get(`${endpoint}/${invoiceId}/pdf`, {
    responseType: "arraybuffer",
    timeout: 30000,
  })
}

export async function getInvoiceStatistics() {
  return await apiClient.getFn<InvoiceStatistics>(`${endpoint}/statistics`)
}

/**
 * Voiding reverses the invoice's charge: payments on it become client credit and
 * its shipments can be invoiced again.
 */
export async function voidInvoice(data: VoidInvoiceInput) {
  return await apiClient.postFn<{ entry_id: EntityId; amount: string }>(
    "/v1/billing/charges/reverse",
    { kind: "invoice", target_id: data.invoiceId, reason: data.reason }
  )
}

/** What happened to the invoice: created, sent, payments, voided. */
export async function getInvoiceActivities(invoiceId: EntityId) {
  return await apiClient.getFn<InvoiceActivity[]>(
    `${endpoint}/${invoiceId}/activities`
  )
}

/**
 * Hides an invoice the client does not owe. The API refuses one that is still
 * charged: void it first.
 */
export async function deleteInvoice(invoiceId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${invoiceId}`)
}

export async function sendInvoiceEmail(invoiceId: EntityId) {
  return await apiClient.postFn<Invoice>(`${endpoint}/${invoiceId}/email`, {})
}
