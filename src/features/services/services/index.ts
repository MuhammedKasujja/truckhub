import {
  ServiceUpdateSchema,
  ServiceCreateSchema,
} from "@/features/services/schemas"
import { createServerFn } from "@tanstack/react-start"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import {
  getServices,
  createService,
  updateService,
  getServiceById,
  deleteServiceById,
  getServicesByQuery,
} from "./server"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getServicesFn = createServerFn().handler(async () => {
  const { data } = await apiResponseTransform(getServices())
  return data
})

export const getServicesByQueryFn = createServerFn()
  .validator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getServicesByQuery(data)
  })

export const getServiceByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(getServiceById(data.id))
  })

export const deleteServiceFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteServiceById(data.id)
  })

export const updateServiceFn = createServerFn({ method: "POST" })
  .validator(ServiceUpdateSchema)
  .handler(async ({ data }) => {
    return updateService(data)
  })

export const createServiceFn = createServerFn({ method: "POST" })
  .validator(ServiceCreateSchema)
  .handler(async ({ data }) => {
    return createService(data)
  })
