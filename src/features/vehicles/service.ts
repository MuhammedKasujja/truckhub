"use server";

import * as apiClient from "@/lib/api-client";
import { Vehicle } from "@/features/vehicles/types";
import {
  VehicleCreateSchemaType,
  VehicleListSearchParams,
  VehicleUpdateSchemaType,
} from "@/features/vehicles/schemas";
import { EntityId, SearchQuery } from "@/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getVehicles(input: Partial<VehicleListSearchParams>) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Vehicle[]>(`/v1/vehicles/?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };
  return { data: isSuccess ? data! : [], error, pagination };
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
  });
}

export async function getVehicleById(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`/v1/vehicles/${vehicleId}`);
}

export async function getVehicleDetailsById(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`/v1/vehicles/${vehicleId}`);
}

export async function deleteVehicleById(vehicleId: EntityId) {
  return await apiClient.deleteFn(`/v1/vehicles/${vehicleId}`);
}

export async function updateVehicle(data: VehicleUpdateSchemaType) {
  const { id: vehicleId, ...rest } = data;
  return await apiClient.putFn(`/v1/vehicles/${vehicleId}`, rest);
}

export async function createVehicle(data: VehicleCreateSchemaType) {
  return await apiClient.postFn("/v1/vehicles", data);
}

export async function vehicleAssignDriver({
  vehicle_id,
  driver_id,
}: {
  vehicle_id: EntityId;
  driver_id: EntityId;
}) {
  return await apiClient.postFn(`/v1/vehicles/${vehicle_id}/driver`, {
    driver_id,
  });
}
