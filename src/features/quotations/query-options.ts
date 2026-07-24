import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { QuotationListSearchParams } from "./schemas"
import { getQuotationDetailsFn, getQuotationsFn } from "./services"

export const quotationQueryKeys = {
  all: () => ["quotations"],
  list: () => [...quotationQueryKeys.all(), "list"],
  search: (search?: string) => [...quotationQueryKeys.all(), "search", search],
  detail: (id: EntityId) => [...quotationQueryKeys.all(), "detail", id],
}

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
