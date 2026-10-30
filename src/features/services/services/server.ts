"use server"

import * as apiClient from "@/lib/api-client"
import {
  Service,
  toServicePricingApiPayload,
} from "@/features/services/types"
import {
  ServiceCreateSchemaInput,
  ServiceUpdateSchemaInput,
} from "@/features/services/schemas"
import { SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "/v1/services"

export async function getServices() {
  return await apiClient.getFn<Service[]>(endpoint)
}

export async function getServicesByQuery(query: SearchQuery) {
  const params = generateApiSearchParams(query)

  const { data, isSuccess, error } = await apiClient.getFn<Service[]>(
    `${endpoint}/?${params}`
  )
  return { data: isSuccess ? data! : [], error }
}

export async function getServiceById(serviceId: number | string) {
  return await apiClient.getFn<Service>(`${endpoint}/${serviceId}`)
}

export async function deleteServiceById(serviceId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${serviceId}`)
}

export async function updateService(data: ServiceUpdateSchemaInput) {
  const { id: serviceId, ...rest } = data
  return await apiClient.putFn<Service>(
    `${endpoint}/${serviceId}`,
    toServicePricingApiPayload(rest)
  )
}

export async function createService(data: ServiceCreateSchemaInput) {
  return await apiClient.postFn<Service>(
    endpoint,
    toServicePricingApiPayload(data)
  )
}
