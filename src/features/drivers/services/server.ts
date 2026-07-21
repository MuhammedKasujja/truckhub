"use server";

import * as apiClient from "@/lib/api-client";
import { Driver } from "@/features/drivers/types";
import {
  DriverCreateSchemaType,
  DriverListSearchParams,
  DriverUpdateSchemaType,
} from "@/features/drivers/schemas";
import { EntityId, SearchQuery } from "@/schemas";
import { generateApiSearchParams } from "@/lib/search-params";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getDrivers(input: DriverListSearchParams) {
  const params = generateApiSearchParams(input);

  const response = await apiClient.getPaginatedFn<Driver[]>(`/v1/drivers/?${params}`);

  if (response.success) {
    return  { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getDriversByQuery({ search }: SearchQuery) {
  return getDrivers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  });
}

export async function getDriverById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`/v1/drivers/${driverId}`);
}

export async function getDriverDetailsById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`/v1/drivers/${driverId}`);
}

export async function deleteDriverById(driverId: number | string) {
  return await apiClient.deleteFn(`/v1/drivers/${driverId}`);
}

export async function updateDriver(data: DriverUpdateSchemaType) {
  const { id: driverId, ...rest } = data;
  return await apiClient.putFn<Driver>(`/v1/drivers/${driverId}`, rest);
}

export async function createDriver(data: DriverCreateSchemaType) {
  return await apiClient.postFn<Driver>("/v1/drivers", data);
}
