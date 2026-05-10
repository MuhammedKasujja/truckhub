import {
  ServiceUpdateSchemaType,
  ServiceCreateSchemaType,
  ServiceSearchParamsCache,
} from "@/features/services/schemas"
import { SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import {
  getServices,
  createService,
  updateService,
  getServiceById,
  deleteServiceById,
  getServicesByQuery,
} from "./data"

export const getServicesFn = createServerFn()
  .inputValidator((data) => ServiceSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getServices(data)
  })

export function getServicesByQueryFn(query: SearchQuery) {
  return getServicesByQuery(query)
}

export async function getServiceByIdFn(serviceId: number | string) {
  return getServiceById(serviceId)
}

export async function deleteServiceByIdFn(serviceId: number | string) {
  return await deleteServiceById(serviceId)
}

export async function updateServiceFn(data: ServiceUpdateSchemaType) {
  return await updateService(data)
}

export async function createServiceFn(data: ServiceCreateSchemaType) {
  return await createService(data)
}
