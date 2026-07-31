"use server"

import * as apiClient from "@/lib/api-client"
import { Service, ServiceGroup } from "@/features/services/types"
import {
  ServiceListSearchParams,
  ServiceUpdateSchemaType,
  ServiceCreateSchemaType,
} from "@/features/services/schemas"
import { SearchQuery } from "@/schemas"
import { jsonFormatter, logger } from "@/lib/logger"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "/v1/services"

export async function getServices(_: ServiceListSearchParams) {
  const { data, isSuccess, error } = await apiClient.getFn<Service[]>(endpoint)
  const grouped = Object.groupBy(data! ?? [], (service, _) => service.category)

  const services: ServiceGroup[] = Object.entries(grouped).map(
    ([category, services]) => ({
      category: category,
      is_truck: services?.at(0)?.is_truck ?? false,
      services: services ?? [],
    })
  )

  logger.error(jsonFormatter(services))
  return { data: isSuccess ? services : [], error }
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

export async function updateService(data: ServiceUpdateSchemaType) {
  const { id: serviceId, ...rest } = data
  return await apiClient.putFn<Service>(`${endpoint}/${serviceId}`, rest)
}

export async function createService(data: ServiceCreateSchemaType) {
  return await apiClient.postFn<Service>(endpoint, data)
}
