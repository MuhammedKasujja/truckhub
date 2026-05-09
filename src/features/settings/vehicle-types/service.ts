"use server";

import * as apiClient from "@/lib/api-client";
import { VehicleType } from "@/features/settings/vehicle-types/types";
import {
  VehicleTypeCreateSchemaType,
  VehicleTypeListSearchParams,
  VehicleTypeUpdateSchemaType,
} from "@/features/settings/vehicle-types/schemas";

const endpoint = "/v1/vehicle-types";

export async function getVehicleTypes(input: VehicleTypeListSearchParams) {
  const { data, isSuccess, error } = await apiClient.getFn<VehicleType[]>(
    `${endpoint}?limit=40`,
  );
  return { data: isSuccess ? data! : [], error };
}

export async function getVehicleTypeById(vehicleTypeId: number | string) {
  return await apiClient.getFn<VehicleType>(`${endpoint}/${vehicleTypeId}`);
}

export async function deleteVehicleTypeById(vehicleTypeId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${vehicleTypeId}`);
}

export async function updateVehicleType(data: VehicleTypeUpdateSchemaType) {
  const { id: vehicleTypeId, ...rest } = data;
  return await apiClient.putFn(`${endpoint}/${vehicleTypeId}`, rest);
}

export async function createVehicleType(data: VehicleTypeCreateSchemaType) {
  return await apiClient.postFn(endpoint, data);
}
