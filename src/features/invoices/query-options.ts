import { EntityId } from "@/schemas"
import { InvoiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getInvoicesFn,
  getInvoiceDetailsFn,
  getInvoiceActivitiesFn,
  getInvoiceStatisticsFn,
} from "./services"

export const invoiceQueryKeys = {
  all: () => ["invoices"] as const,
  list: () => [...invoiceQueryKeys.all(), "list"] as const,
  statistics: () => [...invoiceQueryKeys.list(), "statistics"] as const,
  search: (search?: InvoiceListSearchParams) =>
    [...invoiceQueryKeys.list(), "search", search] as const,
  details: () => [...invoiceQueryKeys.all(), "detail"] as const,
  detail: (id: EntityId) => [...invoiceQueryKeys.details(), id] as const,
  // Under the detail key, so refreshing an invoice refreshes its timeline
  activities: (id: EntityId) =>
    [...invoiceQueryKeys.detail(id), "activities"] as const,
} as const

export const invoiceQueryOptions = (search: InvoiceListSearchParams) =>
  queryOptions({
    queryKey: [...invoiceQueryKeys.list(), search],
    queryFn: () => getInvoicesFn({ data: search }),
  })

export const invoiceDetailsQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: invoiceQueryKeys.detail(id),
    queryFn: () => getInvoiceDetailsFn({ data: { id } }),
  })

export const invoiceListSearchQueryOptions = (params: InvoiceListSearchParams) => ({
  queryKey: invoiceQueryKeys.search(params), // no page here
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getInvoicesFn({
      data: { ...params, page: pageParam },
    }),
  initialPageParam: 1,
})

export const invoiceStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: invoiceQueryKeys.statistics(),
    queryFn: () => getInvoiceStatisticsFn(),
  })

export const invoiceActivitiesQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: invoiceQueryKeys.activities(id),
    queryFn: () => getInvoiceActivitiesFn({ data: { id } }),
  })
