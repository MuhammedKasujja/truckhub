import { queryOptions } from "@tanstack/react-query"
import {
  getQuotationActivitiesFn,
  getQuotationDetailsFn,
  getQuotationShipmentsFn,
  getQuotationsFn,
} from "./services"
import type {
  QuotationListSearchParams,
  QuotationShipmentInput,
} from "./schemas"
import type { EntityId } from "@/schemas"

export type QuotationFilterParams = Omit<
  QuotationListSearchParams,
  "page" | "sort"
>

export const quotationQueryKeys = {
  all: () => ["quotations"],
  list: () => [...quotationQueryKeys.all(), "list"],
  search: (search?: string) => [...quotationQueryKeys.all(), "search", search],
  details: () => [...quotationQueryKeys.all(), "details"],
  detail: (id: EntityId) => [...quotationQueryKeys.details(), id],
  shipments: (id: EntityId) => [...quotationQueryKeys.detail(id), "shipments"],
  // Under the detail key, so refreshing a quotation refreshes its timeline
  activities: (id: EntityId) => [
    ...quotationQueryKeys.detail(id),
    "activities",
  ],
} as const

export const quotationQueryOptions = (search: QuotationListSearchParams) =>
  queryOptions({
    queryKey: [...quotationQueryKeys.list(), search],
    queryFn: () => getQuotationsFn({ data: search }),
  })

export const quotationDetailsQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: quotationQueryKeys.detail(id),
    queryFn: () => getQuotationDetailsFn({ data: { id } }),
  })

export const quotationShipmentsQueryOptions = (
  search: QuotationShipmentInput
) =>
  queryOptions({
    // Include the filters so e.g. "captured details only" and "all" lists don't share a cache entry
    queryKey: [...quotationQueryKeys.shipments(search.quotation_id), search],
    queryFn: () => getQuotationShipmentsFn({ data: { ...search } }),
  })

export const quotationFilterQueryOptions = (params: QuotationFilterParams) => ({
  queryKey: [...quotationQueryKeys.list(), params],
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getQuotationsFn({
      data: { ...params, page: pageParam },
    }),
  initialPageParam: 1,
})

export const quotationActivitiesQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: quotationQueryKeys.activities(id),
    queryFn: () => getQuotationActivitiesFn({ data: { id } }),
  })
