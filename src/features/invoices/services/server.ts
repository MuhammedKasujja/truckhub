import { Invoice } from "../types"
import * as apiClient from "@/lib/api-client"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"
import { InvoiceCreateInput, InvoiceListSearchParams } from "../schemas"

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

export async function getInvoicesByQuery({ search }: SearchQuery) {
  return getInvoices({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getInvoiceDetails(invoiceId: EntityId) {
  return await apiClient.getFn<Invoice>(`${endpoint}/${invoiceId}`)
}

export async function createInvoice(data: InvoiceCreateInput) {
  return await apiClient.postFn<Invoice>(endpoint, data)
}
