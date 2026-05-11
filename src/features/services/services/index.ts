import {
  ServiceUpdateSchema,
  ServiceCreateSchema,
  ServiceSearchParamsCache,
} from "@/features/services/schemas"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import {
  getServices,
  createService,
  updateService,
  getServiceById,
  deleteServiceById,
  getServicesByQuery,
} from "./server"

export const getServicesFn = createServerFn()
  .inputValidator((data) => ServiceSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getServices(data)
  })

export function getServicesByQueryFn(query: SearchQuery) {
  return getServicesByQuery(query)
}

export async function getServiceByIdFn(serviceId: EntityId) {
  return getServiceById(serviceId)
}

export async function deleteServiceByIdFn(serviceId: EntityId) {
  return await deleteServiceById(serviceId)
}

export const updateServiceFn = createServerFn({ method: "POST" })
  .inputValidator((data) => ServiceUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    return updateService(data)
  })

export const createServiceFn = createServerFn({ method: "POST" })
  .inputValidator((data) => ServiceCreateSchema.parse(data))
  .handler(async ({ data }) => {
    return createService(data)
  })
