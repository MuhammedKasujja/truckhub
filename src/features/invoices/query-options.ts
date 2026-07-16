import { getInvoicesFn } from "./services"
import { InvoiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const invoiceQueryKeys = {
  all: () => ["invoices"],
  list: () => [...invoiceQueryKeys.all(), "list"],
  search: (search?: string) => [...invoiceQueryKeys.all(), "search", search],
  detail: (id: string) => [...invoiceQueryKeys.all(), "detail", id],
}

export const invoiceQueryOptions = (search: InvoiceListSearchParams) =>
  queryOptions({
    queryKey: [...invoiceQueryKeys.list(), search],
    queryFn: () => getInvoicesFn({ data: search }),
  })
