"use server";

import * as apiClient from "@/lib/api-client";
import { Tonnage } from "@/features/settings/tonnage/types";
import {
  TonnageCreateSchemaType,
  TonnageUpdateSchemaType,
} from "@/features/settings/tonnage/schemas";

export async function getTonnages() {
  const { data, isSuccess, error } =
    await apiClient.getFn<Tonnage[]>("/v1/tonnages");
  return { data: isSuccess ? data! : [], error };
}

// export async function getTonnageById(tonnageId: number | string) {
//   return await apiClient.get<Tonnage>(`/v1/tonnages/${tonnageId}`);
// }

export async function deleteTonnageById(tonnageId: number | string) {
  return await apiClient.deleteFn(`/v1/tonnages/${tonnageId}`);
}

export async function updateTonnage(data: TonnageUpdateSchemaType) {
  const { id: tonnageId, ...rest } = data;
  return await apiClient.putFn(`/v1/tonnages/${tonnageId}`, rest);
}

export async function createTonnage(data: TonnageCreateSchemaType) {
  return await apiClient.postFn("/v1/tonnages", data);
}
