import { Quotation } from "../types"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"
import { CreateQuotationRequest, QuotationListSearchParams } from "../schemas"

const endpoint = "/v1/quotations"

export async function getQuotations(input: QuotationListSearchParams) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Quotation[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function createQuotation(data: CreateQuotationRequest) {
  return await apiClient.postFn<Quotation>(endpoint, data)
}

export async function updateQuotation(data: CreateQuotationRequest) {
  return await apiClient.patchFn<Quotation>(endpoint, data)
}
