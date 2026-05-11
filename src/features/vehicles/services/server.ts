"use server"

import * as apiClient from "@/lib/api-client"
import { Vehicle } from "@/features/vehicles/types"
import {
  AssignDriverVehicleType,
  VehicleCreateSchemaType,
  VehicleListSearchParams,
  VehicleUpdateSchemaType,
} from "@/features/vehicles/schemas"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

const endpoint = "/v1/vehicles"

export async function getVehicles(input: VehicleListSearchParams) {
  const { page, perPage } = input
  const params = generateApiSearchParams(input)

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Vehicle[]>(`${endpoint}/?${params}`)

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 }
  return { data: isSuccess ? data! : [], error, pagination }
}

export async function getVehiclesByQuery({ search }: SearchQuery) {
  return getVehicles({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getVehicleById(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`${endpoint}/${vehicleId}`)
}

export async function getVehicleDetailsById(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`${endpoint}/${vehicleId}`)
}

export async function deleteVehicleById(vehicleId: EntityId) {
  return await apiClient.deleteFn<null>(`${endpoint}/${vehicleId}`)
}

export async function updateVehicle(data: VehicleUpdateSchemaType) {
  const { id: vehicleId, ...rest } = data
  return await apiClient.putFn<Vehicle>(`${endpoint}/${vehicleId}`, rest)
}

export async function createVehicle(data: VehicleCreateSchemaType) {
  return await apiClient.postFn<Vehicle>(endpoint, data)
}

export async function vehicleAssignDriver(data: AssignDriverVehicleType) {
  return await apiClient.postFn<null>(`${endpoint}/${data.vehicleId}/driver`, {
    driver_id: data.driverId,
  })
}
