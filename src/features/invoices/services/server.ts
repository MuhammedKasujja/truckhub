import { Invoice } from "../types"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { InvoiceListSearchParams } from "../schemas"
import { generateApiSearchParams } from "@/lib/search-params"

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
