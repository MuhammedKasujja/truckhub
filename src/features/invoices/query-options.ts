import { EntityId } from "@/schemas"
import { InvoiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getInvoiceDetailsFn, getInvoicesFn } from "./services"

export const invoiceQueryKeys = {
  all: () => ["invoices"],
  list: () => [...invoiceQueryKeys.all(), "list"],
  search: (search?: string) => [...invoiceQueryKeys.all(), "search", search],
  detail: (id: EntityId) => [...invoiceQueryKeys.all(), "detail", id],
}

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
