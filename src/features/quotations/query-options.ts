import { getQuotationsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { QuotationListSearchParams } from "./schemas"

export const quotationQueryKeys = {
  all: () => ["quotation"],
  list: () => [...quotationQueryKeys.all(), "list"],
  search: (search?: string) => [...quotationQueryKeys.all(), "search", search],
  detail: (id: string) => [...quotationQueryKeys.all(), "detail", id],
}

export const quotationQueryOptions = (search: QuotationListSearchParams) =>
  queryOptions({
    queryKey: [...quotationQueryKeys.list(), search],
    queryFn: () => getQuotationsFn({ data: search }),
  })
