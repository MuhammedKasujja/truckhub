import { Quotation, QuotationActivity } from "../types"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"
import {
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationShipmentInput,
  QuotationListSearchParams,
} from "../schemas"
import { api } from "@/lib/api"
import { Shipment } from "@/features/shipments/types"

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

const emptyToNull = (value?: string | null) =>
  value == null || value.trim() === "" ? null : value

/** The API wants null, not "", for "no discount". */
function normalizeDiscounts<T extends CreateQuotationRequest>(data: T): T {
  return {
    ...data,
    discount: emptyToNull(data.discount),
    line_items: data.line_items.map((item) => ({
      ...item,
      discount: emptyToNull(item.discount),
    })),
  }
}

export async function createQuotation(data: CreateQuotationRequest) {
  return await apiClient.postFn<Quotation>(endpoint, normalizeDiscounts(data))
}

export async function updateQuotation(data: UpdateQuotationRequest) {
  const { quotationId, ...rest } = normalizeDiscounts(data)
  return await apiClient.putFn<Quotation>(`${endpoint}/${quotationId}`, rest)
}

export async function getQuotationDetails(quotationId: EntityId) {
  return await apiClient.getFn<Quotation>(`${endpoint}/${quotationId}`)
}

/** What happened to the quotation: created, sent, accepted, ... */
export async function getQuotationActivities(quotationId: EntityId) {
  return await apiClient.getFn<QuotationActivity[]>(
    `${endpoint}/${quotationId}/activities`
  )
}

export async function markQuotationAccepted(quotationId: EntityId) {
  return await apiClient.postFn<Quotation>(
    `${endpoint}/${quotationId}/accept`,
    {}
  )
}

export async function markQuotationRejected(quotationId: EntityId) {
  return await apiClient.postFn<Quotation>(
    `${endpoint}/${quotationId}/reject`,
    {}
  )
}

export async function markQuotationCancelled(quotationId: EntityId) {
  return await apiClient.postFn<Quotation>(
    `${endpoint}/${quotationId}/cancel`,
    {}
  )
}

export async function sendQuotationEmail(quotationId: EntityId) {
  return await apiClient.postFn<Quotation>(
    `${endpoint}/${quotationId}/email`,
    {}
  )
}

export async function markQuotationExpired(quotationId: EntityId) {
  return await apiClient.postFn<Quotation>(
    `${endpoint}/${quotationId}/expired`,
    {}
  )
}

export async function getQuotationReportPdf(quotationId: EntityId) {
  return await api.get(`${endpoint}/${quotationId}/pdf`, {
    responseType: "arraybuffer",
    timeout: 30000,
  })
}

export async function getQuotationShipments(input: QuotationShipmentInput) {
  const params = generateApiSearchParams(input)
  const response = await apiClient.getPaginatedFn<Shipment[]>(
    `/v1/trips?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}
