import { Invoice } from "../types"
import * as apiClient from "@/lib/api-client"
import { InvoiceListSearchParams } from "../schemas"
import { generateApiSearchParams } from "@/lib/search-params"

export async function getInvoices(input: InvoiceListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Invoice[]>(
    `/v1/invoices?${params}`
  )

  if (response.success) {
    return  { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}