"use server";

import * as apiClient from "@/lib/api-client";
import { Booking } from "@/features/bookings/types";
import { Customer } from "@/features/clients/types";
import { RideRequest } from "@/features/ride-requests/types";
import {
  CustomerCreateSchemaType,
  CustomerListSearchParams,
  CustomerUpdateSchemaType,
} from "@/features/clients/schemas";
import { EntityId, SearchQuery } from "@/types";
import { Payment } from "@/features/payments/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

const endpoint = "/v1/clients";

export async function getCustomers(input: CustomerListSearchParams) {
  const { page, perPage } = input;

  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Customer[]>(`${endpoint}?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };
  return { data: isSuccess ? data! : [], error, pagination };
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
  });
}

export async function getCustomerById(passengerId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${passengerId}`);
}

export async function getCustomerDetailsById(passengerId: EntityId) {
  return await apiClient.getFn<Customer>(`${endpoint}/${passengerId}`);
}

export async function deleteCustomerById(passengerId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${passengerId}`);
}

export async function updateCustomer(data: CustomerUpdateSchemaType) {
  const { id: passengerId, ...rest } = data;
  return await apiClient.putFn(`${endpoint}/${passengerId}`, rest);
}

export async function createCustomer(data: CustomerCreateSchemaType) {
  return await apiClient.postFn(endpoint, data);
}

export async function getCustomerPayments(customerId: EntityId) {
  return await apiClient.getFn<Payment[]>(
    `${endpoint}/${customerId}/payments`,
  );
}

export async function getCustomerBookings(customerId: EntityId) {
  return await apiClient.getFn<Booking[]>(
    `${endpoint}/${customerId}/bookings`,
  );
}

export async function getCustomerRides(customerId: EntityId) {
  return await apiClient.getFn<RideRequest[]>(
    `${endpoint}/${customerId}/rides`,
  );
}
