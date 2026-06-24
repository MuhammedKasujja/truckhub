import { EntityId } from "@/schemas"
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
  getClientRoutePricingFn,
  getClientLoadingOffloadingFreesFn,
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
  routePricing: (id: EntityId) => [
    ...clientQueryKeys.details(),
    "route_pricing",
    id,
  ],
  loadingFees: (id: EntityId) => [
    ...clientQueryKeys.details(),
    "loading_fees",
    id,
  ],
  search: (query?: string | undefined) => [
    ...clientQueryKeys.details(),
    "search",
    query,
  ],
  refreshQueries: () => [...clientQueryKeys.list()],
  refreshSingle: (id: EntityId) => [...clientQueryKeys.profile(id)],
} as const

export const clientsQueryOptions = (input: CustomerListSearchParams) =>
  queryOptions({
    queryKey: [...clientQueryKeys.list(), input],
    queryFn: () => getCustomersFn({ data: input }),
  })

export const clientProfileQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.profile(clientId),
    queryFn: () => getClientProfileFn({ data: { id: clientId } }),
  })

export const clientsSearchQueryOptions = (query?: string | undefined) =>
  queryOptions({
    queryKey: clientQueryKeys.search(query),
    queryFn: () => getClientsByQueryFn({ data: { search: query } }),
  })

export const clientEditQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.edit(clientId),
    queryFn: () => getClientByIdFn({ data: { id: clientId } }),
  })

export const clientPaymentsQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.payments(clientId),
    queryFn: () => getClientPaymentsFn({ data: { id: clientId } }),
  })

export const clientBookingsQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.bookings(clientId),
    queryFn: () => getClientBookingsFn({ data: { id: clientId } }),
  })

export const clientRidesQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.rides(clientId),
    queryFn: () => getClientRidesFn({ data: { id: clientId } }),
  })

export const clientRoutePricingQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.routePricing(clientId),
    queryFn: () => getClientRoutePricingFn({ data: { id: clientId } }),
  })

export const clientLoadingFeesQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.loadingFees(clientId),
    queryFn: () =>
      getClientLoadingOffloadingFreesFn({ data: { id: clientId } }),
  })
