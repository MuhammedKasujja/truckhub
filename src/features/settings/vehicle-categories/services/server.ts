"use server";

import * as apiClient from "@/lib/api-client";
import { VehicleCategory } from "@/features/settings/vehicle-categories/types";
import {
  VehicleCategoryCreateSchemaType,
  VehicleCategoryListSearchParams,
  VehicleCategoryUpdateSchemaType,
} from "@/features/settings/vehicle-categories/schemas";
import { EntityId } from "@/schemas";

const endpoint = "/v1/vehicle-categories";

export async function getVehicleCategorys(input: VehicleCategoryListSearchParams) {
  const { data, isSuccess, error } = await apiClient.getFn<VehicleCategory[]>(
    `${endpoint}?limit=${input.perPage}`,
  );
  return { data: isSuccess ? data! : [], error };
}

export async function getVehicleCategoryById(categoryId: EntityId) {
  return await apiClient.getFn<VehicleCategory>(`${endpoint}/${categoryId}`);
}

export async function deleteVehicleCategoryById(categoryId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${categoryId}`);
}

export async function updateVehicleCategory(data: VehicleCategoryUpdateSchemaType) {
  const { id: categoryId, ...rest } = data;
  return await apiClient.putFn<VehicleCategory>(`${endpoint}/${categoryId}`, rest);
}

export async function createVehicleCategory(data: VehicleCategoryCreateSchemaType) {
  return await apiClient.postFn<VehicleCategory>(endpoint, data);
}
