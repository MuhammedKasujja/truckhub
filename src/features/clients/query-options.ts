import { EntityId } from "@/types"
import { CustomerListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getCustomersFn,
  getClientByIdFn,
  getClientRidesFn,
  getClientProfileFn,
  getClientBookingsFn,
  getClientPaymentsFn,
  getClientsByQueryFn,
} from "./services"

export const clientQueryKeys = {
  all: () => ["clients"],
  list: () => [...clientQueryKeys.all(), "list"],
  details: () => [...clientQueryKeys.all(), "detail"],
  detail: (id: EntityId) => [...clientQueryKeys.details(), id],
  edit: (id: EntityId) => [...clientQueryKeys.details(), "edit", id],
  profile: (id: EntityId) => [...clientQueryKeys.details(), "profile", id],
  payments: (id: EntityId) => [...clientQueryKeys.details(), "payments", id],
  bookings: (id: EntityId) => [...clientQueryKeys.details(), "bookings", id],
  rides: (id: EntityId) => [...clientQueryKeys.details(), "rides", id],
  search: (query?: string | undefined) => [
    ...clientQueryKeys.details(),
    "search",
    query,
  ],
} as const

export const clientsQueryOptions = (input: CustomerListSearchParams) =>
  queryOptions({
    queryKey: [...clientQueryKeys.list(), input],
    queryFn: () => getCustomersFn({ data: input }),
  })

export const clientProfileQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.profile(customerId),
    queryFn: () => getClientProfileFn({ data: { id: customerId } }),
  })

export const clientsSearchQueryOptions = (query?: string | undefined) =>
  queryOptions({
    queryKey: clientQueryKeys.search(query),
    queryFn: () => getClientsByQueryFn({ data: { search: query } }),
  })

export const clientEditQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.edit(customerId),
    queryFn: () => getClientByIdFn({ data: { id: customerId } }),
  })

export const clientPaymentsQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.payments(customerId),
    queryFn: () => getClientPaymentsFn({ data: { id: customerId } }),
  })

export const clientBookingsQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.bookings(customerId),
    queryFn: () => getClientBookingsFn({ data: { id: customerId } }),
  })

export const clientRidesQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.rides(customerId),
    queryFn: () => getClientRidesFn({ data: { id: customerId } }),
  })
