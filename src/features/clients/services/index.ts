import {
  CustomerUpdateSchema,
  CustomerCreateSchema,
  CustomerSearchParamsCache,
} from "@/features/clients/schemas"
import { createServerFn } from "@tanstack/react-start"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import {
  getCustomers,
  createClient,
  updateClient,
  getClientRides,
  getCustomerById,
  getClientBookings,
  getClientPayments,
  deleteCustomerById,
  getCustomersByQuery,
  getCustomerDetailsById,
} from "./server"

export const getCustomersFn = createServerFn()
  .inputValidator((data) => CustomerSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getCustomers(data)
  })

export const getClientsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getCustomersByQuery(data)
  })

export const getClientByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCustomerById(data.id)
  })

export const getClientProfileFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getCustomerDetailsById(data.id)
  })

export const deleteClientFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteCustomerById(data.id)
  })

export const updateClientFn = createServerFn({ method: "POST" })
  .inputValidator(CustomerUpdateSchema)
  .handler(async ({ data }) => {
    return updateClient(data)
  })

export const createClientFn = createServerFn({ method: "POST" })
  .inputValidator(CustomerCreateSchema)
  .handler(async ({ data }) => {
    return createClient(data)
  })

export const getClientPaymentsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientPayments(data.id)
  })

export const getClientBookingsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientBookings(data.id)
  })

export const getClientRidesFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getClientRides(data.id)
  })
