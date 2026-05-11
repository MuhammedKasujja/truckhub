import {
  ServiceUpdateSchema,
  ServiceCreateSchema,
  ServiceSearchParamsCache,
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

export const getServicesFn = createServerFn()
  .inputValidator((data) => ServiceSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getServices(data)
  })

export const getServicesByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getServicesByQuery(data)
  })

export const getServiceByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getServiceById(data.id)
  })

export const deleteServiceFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteServiceById(data.id)
  })

export const updateServiceFn = createServerFn({ method: "POST" })
  .inputValidator(ServiceUpdateSchema)
  .handler(async ({ data }) => {
    return updateService(data)
  })

export const createServiceFn = createServerFn({ method: "POST" })
  .inputValidator(ServiceCreateSchema)
  .handler(async ({ data }) => {
    return createService(data)
  })
