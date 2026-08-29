import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { QuotationListSearchParams, QuotationShipmentInput } from "./schemas"
import {
  getQuotationsFn,
  getQuotationDetailsFn,
  getQuotationShipmentsFn,
} from "./services"

export const quotationQueryKeys = {
  all: () => ["quotations"],
  list: () => [...quotationQueryKeys.all(), "list"],
  search: (search?: string) => [...quotationQueryKeys.all(), "search", search],
  details: () => [...quotationQueryKeys.all(), "details"],
  detail: (id: EntityId) => [...quotationQueryKeys.details(), id],
  shipments: (id: EntityId) => [...quotationQueryKeys.detail(id), "shipments"],
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
    queryKey: quotationQueryKeys.shipments(search.quotation_id),
    queryFn: () => getQuotationShipmentsFn({ data: { ...search } }),
  })
