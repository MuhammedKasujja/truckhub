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
  return (data ?? []).map((service) => ({
    ...service,
    display_name:
      service.vehicle_category?.name ??
      `${service.car_model?.car_brand.name} ${
        service.car_model?.name
      } (${service.car_model?.manufacture_year})`,
  }))
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
