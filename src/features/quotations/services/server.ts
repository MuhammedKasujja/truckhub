import { Quotation } from "../types"
import * as apiClient from "@/lib/api-client"
import { QuotationListSearchParams } from "../schemas"
import { generateApiSearchParams } from "@/lib/search-params"

export async function getQuotations(input: QuotationListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Quotation[]>(
    `/v1/quotations?${params}`
  )

  if (response.success) {
    return  { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}