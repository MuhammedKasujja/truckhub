"use server";

import * as apiClient from "@/lib/api-client";
import { Driver } from "@/features/drivers/types";
import {
  DriverCreateSchemaType,
  DriverListSearchParams,
  DriverUpdateSchemaType,
} from "@/features/drivers/schemas";
import { EntityId, SearchQuery } from "@/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getDrivers(input: DriverListSearchParams) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Driver[]>(`/v1/drivers/?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };
  return { data: isSuccess ? data! : [], error, pagination };
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
  return await apiClient.putFn(`/v1/drivers/${driverId}`, rest);
}

export async function createDriver(data: DriverCreateSchemaType) {
  return await apiClient.postFn("/v1/drivers", data);
}
