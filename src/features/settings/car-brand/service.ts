"use server";

import * as apiClient from "@/lib/api-client";
import { CarBrand } from "@/features/settings/car-brand/types";
import {
  CarBrandCreateSchemaType,
  CarBrandListSearchParams,
  CarBrandUpdateSchemaType,
} from "@/features/settings/car-brand/schemas";

export async function getCarBrands(input: CarBrandListSearchParams) {
  const { data, isSuccess, error } =
    await apiClient.getFn<CarBrand[]>("/v1/car-brands");
  return { data: isSuccess ? data! : [], error };
}

export async function getCarBrandById(carBrandId: number | string) {
  return await apiClient.getFn<CarBrand>(`/v1/car-brands/${carBrandId}`);
}

export async function deleteCarBrandById(carBrandId: number | string) {
  return await apiClient.deleteFn(`/v1/car-brands/${carBrandId}`);
}

export async function updateCarBrand(data: CarBrandUpdateSchemaType) {
  const { id: carBrandId, ...rest } = data;
  return await apiClient.putFn(`/v1/car-brands/${carBrandId}`, rest);
}

export async function createCarBrand(data: CarBrandCreateSchemaType) {
  return await apiClient.postFn("/v1/car-brands", data);
}
