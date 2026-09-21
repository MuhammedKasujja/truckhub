"use server"

import * as apiClient from "@/lib/api-client"
import { CarModel } from "@/features/settings/car-model/types"
import {
  CarModelCreateSchemaType,
  CarModelListSearchParams,
  CarModelUpdateSchemaType,
} from "@/features/settings/car-model/schemas"

const endpoint = "/v1/car-models"

export async function getCarModels(input: CarModelListSearchParams) {
  const { data, isSuccess, error } = await apiClient.getFn<CarModel[]>(endpoint)
  return { data: isSuccess ? data! : [], error }
}

export async function getCarModelById(carModelId: number | string) {
  return await apiClient.getFn<CarModel>(`${endpoint}/${carModelId}`)
}

export async function deleteCarModelById(carModelId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${carModelId}`)
}

export async function updateCarModel(data: CarModelUpdateSchemaType) {
  const { id: carModelId, ...rest } = data
  return await apiClient.putFn<CarModel>(`${endpoint}/${carModelId}`, rest)
}

export async function createCarModel(data: CarModelCreateSchemaType) {
  return await apiClient.postFn<CarModel>(endpoint, data)
}
