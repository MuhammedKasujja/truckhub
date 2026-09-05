"use server"

import * as apiClient from "@/lib/api-client"
import { Vehicle, VehicleStatistics } from "@/features/vehicles/types"
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
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<Vehicle[]>(
    `${endpoint}/?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
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

export async function vehicleUnAssignDriver(vehicleId: EntityId) {
  return await apiClient.postFn<null>(
    `${endpoint}/${vehicleId}/assignments/unassign`,
    {}
  )
}

export async function getVehicleStatistics() {
  return await apiClient.getFn<VehicleStatistics>(`${endpoint}/statistics`)
}
