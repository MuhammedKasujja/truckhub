import { EntityId, SearchQuery } from "@/schemas"
import { InvoiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getInvoicesFn,
  getInvoiceDetailsFn,
  getInvoicesByQueryFn,
  getInvoiceStatisticsFn,
} from "./services"

export const invoiceQueryKeys = {
  all: () => ["invoices"],
  list: () => [...invoiceQueryKeys.all(), "list"],
  statistics: () => [...invoiceQueryKeys.list(), "statistics"],
  search: (search?: string | null) => [
    ...invoiceQueryKeys.all(),
    "search",
    search,
  ],
  detail: (id: EntityId) => [...invoiceQueryKeys.all(), "detail", id],
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

export const invoiceListSearchQueryOptions = ({ search }: SearchQuery) =>
  queryOptions({
    queryKey: invoiceQueryKeys.search(search),
    queryFn: () => getInvoicesByQueryFn({ data: { search } }),
  })

export const invoiceStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: invoiceQueryKeys.statistics(),
    queryFn: () => getInvoiceStatisticsFn(),
  })
