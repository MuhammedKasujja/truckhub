"use server"

import * as apiClient from "@/lib/api-client"
import { Booking } from "@/features/bookings/types"
import { Customer } from "@/features/clients/types"
import { RideRequest } from "@/features/ride-requests/types"
import {
  CustomerCreateSchemaType,
  CustomerUpdateSchemaType,
  CustomerListSearchParams,
} from "@/features/clients/schemas"
import { EntityId, SearchQuery } from "@/schemas"
import { Payment } from "@/features/payments/types"
import { generateApiSearchParams } from "@/lib/search-params"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"
import {
  BatchPayload,
  BatchPricingPayload,
} from "@/features/settings/pricing/schemas"
import { RoutePricingResponse } from "@/features/settings/pricing/types"

const endpoint = "/v1/clients"

export async function getCustomers(input: CustomerListSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<Customer[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getCustomersByQuery({ search }: SearchQuery) {
  return getCustomers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getCustomerById(clientId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${clientId}`)
}

export async function getCustomerDetailsById(customerId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${customerId}`)
}

export async function deleteCustomerById(clientId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${clientId}`)
}

export async function updateClient(data: CustomerUpdateSchemaType) {
  const { id: clientId, ...rest } = data
  return await apiClient.putFn<Customer>(`${endpoint}/${clientId}`, rest)
}

export async function createClient(data: CustomerCreateSchemaType) {
  return await apiClient.postFn<Customer>(endpoint, data)
}

export async function getClientPayments(clientId: EntityId) {
  return await apiClient.getFn<Payment[]>(`${endpoint}/${clientId}/payments`)
}

export async function getClientBookings(clientId: EntityId) {
  return await apiClient.getFn<Booking[]>(`${endpoint}/${clientId}/bookings`)
}

export async function getClientRides(clientId: EntityId) {
  return await apiClient.getFn<RideRequest[]>(`${endpoint}/${clientId}/rides`)
}

export async function createClientBatchRoutePricing(data: BatchPricingPayload) {
  const { client_id, ...rest } = data
  return await apiClient.postFn<BatchPayload>(
    `${endpoint}/${client_id}/routes/pricing`,
    rest
  )
}

export async function getClientRoutePricing(clientId: EntityId) {
  // `${endpoint}/${clientId}/routes/pricing?date=2026-05-26`
  const url = `${endpoint}/${clientId}/routes/pricing`
  return await apiClient.getFn<RoutePricingResponse>(url)
}
