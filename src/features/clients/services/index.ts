import * as apiClient from "@/lib/api-client"
import { Booking } from "@/features/bookings/types"
import { Customer } from "@/features/clients/types"
import { RideRequest } from "@/features/ride-requests/types"
import {
  CustomerCreateSchemaType,
  CustomerUpdateSchemaType,
  CustomerSearchParamsCache,
} from "@/features/clients/schemas"
import { getCustomers } from "./data"
import { EntityId, SearchQuery } from "@/types"
import { Payment } from "@/features/payments/types"
import { createServerFn } from "@tanstack/react-start"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

const endpoint = "/v1/clients"

export const getCustomersFn = createServerFn()
  .inputValidator((data) => CustomerSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getCustomers(data)
  })

export async function getCustomersByQueryFn({ search }: SearchQuery) {
  return getCustomersFn({
    data: {
      page: 1,
      perPage: DEFAULT_FITER_QUERY_PER_PAGE,
      sort: [],
      search: search ?? "",
      created_at: [],
      filters: [],
      joinOperator: "and",
    },
  })
}

export async function getCustomerById(passengerId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${passengerId}`)
}

export async function getCustomerDetailsById(customerId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${customerId}`)
}

export async function deleteCustomerById(passengerId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${passengerId}`)
}

export async function updateCustomer(data: CustomerUpdateSchemaType) {
  const { id: passengerId, ...rest } = data
  return await apiClient.putFn(`${endpoint}/${passengerId}`, rest)
}

export async function createCustomer(data: CustomerCreateSchemaType) {
  return await apiClient.postFn(endpoint, data)
}

export async function getCustomerPayments(customerId: EntityId) {
  return await apiClient.getFn<Payment[]>(`${endpoint}/${customerId}/payments`)
}

export async function getCustomerBookings(customerId: EntityId) {
  return await apiClient.getFn<Booking[]>(`${endpoint}/${customerId}/bookings`)
}

export async function getCustomerRides(customerId: EntityId) {
  return await apiClient.getFn<RideRequest[]>(`${endpoint}/${customerId}/rides`)
}
