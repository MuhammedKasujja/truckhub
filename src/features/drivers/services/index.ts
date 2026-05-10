"use server"

import * as apiClient from "@/lib/api-client"
import { Driver } from "@/features/drivers/types"
import {
  DriverCreateSchemaType,
  DriverUpdateSchemaType,
  DriverSearchParamsCache,
} from "@/features/drivers/schemas"
import { getDrivers } from "./data"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

export const getDriversFn = createServerFn()
  .inputValidator((data) => DriverSearchParamsCache.parse(data))
  .handler(({ data }) => {
    return getDrivers(data)
  })

export async function getDriversByQueryFn({ search }: SearchQuery) {
  return getDrivers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getDriverById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`/v1/drivers/${driverId}`)
}

export async function getDriverDetailsById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`/v1/drivers/${driverId}`)
}

export async function deleteDriverById(driverId: number | string) {
  return await apiClient.deleteFn(`/v1/drivers/${driverId}`)
}

export async function updateDriver(data: DriverUpdateSchemaType) {
  const { id: driverId, ...rest } = data
  return await apiClient.putFn(`/v1/drivers/${driverId}`, rest)
}

export async function createDriver(data: DriverCreateSchemaType) {
  return await apiClient.postFn("/v1/drivers", data)
}
