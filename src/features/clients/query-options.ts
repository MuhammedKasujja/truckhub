import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { ClientListSearchParams, ClientPricingSearchParam } from "./schemas"
import {
  getCustomersFn,
  getClientByIdFn,
  getClientProfileFn,
  getClientPaymentsFn,
  getClientsByQueryFn,
  getClientInvoicesFn,
  getClientServicesFn,
  getClientQuotationsFn,
  getClientRoutePricingFn,
  getClientLoadingOffloadingFreesFn,
  getClientActiveLoadingOffloadingFreesFn,
} from "./services"
import { getClientPricingDatesFn } from "../settings/pricing/services"

export interface ClientSearchParams {
  search: string
  perPage: number
}

export const clientQueryKeys = {
  all: () => ["clients"],
  list: () => [...clientQueryKeys.all(), "list"],
  details: () => [...clientQueryKeys.all(), "detail"],
  detail: (id: EntityId) => [...clientQueryKeys.details(), id],
  edit: (id: EntityId) => [...clientQueryKeys.detail(id), "edit"],
  profile: (id: EntityId) => [...clientQueryKeys.detail(id), "profile"],
  payments: (id: EntityId) => [...clientQueryKeys.detail(id), "payments"],
  invoices: (id: EntityId) => [...clientQueryKeys.detail(id), "invoices"],
  quotations: (id: EntityId) => [...clientQueryKeys.detail(id), "quotations"],
  pricingDates: (id: EntityId) => [
    ...clientQueryKeys.detail(id),
    "pricing-dates",
  ],
  serviceProducts: (id: EntityId) => [
    ...clientQueryKeys.detail(id),
    "services-products",
  ],
  routePricing: (id: EntityId) => [
    ...clientQueryKeys.detail(id),
    "route_pricing",
  ],
  loadingFees: (search: ClientPricingSearchParam) => [
    ...clientQueryKeys.detail(search.clientId),
    "loading_fees",
    search.referenceDate,
  ],
  loadingFeesActive: (id: EntityId) => [
    ...clientQueryKeys.detail(id),
    "loading_fees",
    "active",
  ],
  search: (params: ClientSearchParams) => [
    ...clientQueryKeys.list(),
    "search",
    params,
  ],
  filter: () => [...clientQueryKeys.list(), "filter-list"],
  refreshQueries: () => [...clientQueryKeys.list()],
  refreshSingle: (id: EntityId) => [...clientQueryKeys.details(), id],
} as const

export const clientsQueryOptions = (input: ClientListSearchParams) =>
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
    queryKey: clientQueryKeys.search({ search: query ?? "", perPage: 10 }),
    queryFn: () => getClientsByQueryFn({ data: { search: query } }),
  })

export const clientListQueryOptions = (params: ClientSearchParams) => ({
  queryKey: [...clientQueryKeys.filter(), params.search, params.perPage], // no page here
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getClientsByQueryFn({
      data: { search: params.search, perPage: params.perPage, page: pageParam },
    }),
  initialPageParam: 1,
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

export const clientInvoicesQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.invoices(clientId),
    queryFn: () => getClientInvoicesFn({ data: { id: clientId } }),
  })

export const clientQuotationsQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.quotations(clientId),
    queryFn: () => getClientQuotationsFn({ data: { id: clientId } }),
  })

export const clientRoutePricingQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.routePricing(clientId),
    queryFn: () => getClientRoutePricingFn({ data: { id: clientId } }),
  })

export const clientLoadingFeesQueryOptions = (
  search: ClientPricingSearchParam
) =>
  queryOptions({
    queryKey: clientQueryKeys.loadingFees(search),
    queryFn: () => getClientLoadingOffloadingFreesFn({ data: search }),
  })

export const clientActiveLoadingFeesQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.loadingFeesActive(clientId),
    queryFn: () =>
      getClientActiveLoadingOffloadingFreesFn({ data: { id: clientId } }),
  })

export const clientServiceProductsQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.serviceProducts(clientId),
    enabled: !!clientId,
    queryFn: () => getClientServicesFn({ data: { id: clientId } }),
  })
  
export const clientPricingDatesQueryOptions = (clientId: EntityId) =>
  queryOptions({
    queryKey: clientQueryKeys.pricingDates(clientId),
    enabled: !!clientId,
    queryFn: () => getClientPricingDatesFn({ data: { id: clientId } }),
  })
