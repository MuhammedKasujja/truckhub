"use server";

import * as apiClient from "@/lib/api-client";
import { CarModel } from "@/features/settings/car-model/types";
import {
  CarModelCreateSchemaType,
  CarModelListSearchParams,
  CarModelUpdateSchemaType,
} from "@/features/settings/car-model/schemas";

export async function getCarModels(input: CarModelListSearchParams) {
  const { data, isSuccess, error } =
    await apiClient.getFn<CarModel[]>("/v1/car-models");
  return { data: isSuccess ? data! : [], error };
}

export async function getCarModelById(carModelId: number | string) {
  return await apiClient.getFn<CarModel>(`/v1/car-models/${carModelId}`);
}

export async function deleteCarModelById(carModelId: number | string) {
  return await apiClient.deleteFn(`/v1/car-models/${carModelId}`);
}

export async function updateCarModel(data: CarModelUpdateSchemaType) {
  const { id: carModelId, ...rest } = data;
  return await apiClient.putFn(`/v1/car-models/${carModelId}`, rest);
}

export async function createCarModel(data: CarModelCreateSchemaType) {
  return await apiClient.postFn("/v1/car-models", data);
}
