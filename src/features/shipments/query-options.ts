import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { getShipmentByIdFn, getShipmentsFn } from "./services"
import {
  ShipmentSearchParamsInput,
  QuotationShipmentSearchParams,
} from "./schemas"

export const shipmentsQueryKeys = {
  all: () => ["shipments"],
  list: () => [...shipmentsQueryKeys.all(), "list"],
  active: () => [...shipmentsQueryKeys.list(), "active"],
  confirmed: () => [...shipmentsQueryKeys.list(), "confirmed"],
  requested: () => [...shipmentsQueryKeys.list(), "requested"],
  completed: () => [...shipmentsQueryKeys.list(), "completed"],
  details: () => [...shipmentsQueryKeys.all(), "detail"],
  search: () => [...shipmentsQueryKeys.all(), "search"],
  detail: (id: EntityId) => [...shipmentsQueryKeys.details(), id],
  quotation: (quotationId: EntityId) => [
    ...shipmentsQueryKeys.all(),
    "quotation",
    quotationId,
  ],
} as const

export const shipmentsQueryOptions = (search: ShipmentSearchParamsInput) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.list(),
    queryFn: () => getShipmentsFn({ data: search }),
  })

export const shipmentsConfirmedQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.confirmed(),
    queryFn: () =>
      getShipmentsFn({
        data: { ...search, status: ["assigned", "vehicle_assigned"] },
      }),
  })

export const shipmentsActiveQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.active(),
    queryFn: () =>
      getShipmentsFn({
        data: { ...search, status: ["in_progress", "dispatched", "delayed"] },
      }),
  })

export const shipmentsRequestsQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.requested(),
    queryFn: () =>
      getShipmentsFn({ data: { ...search, status: ["unassigned"] } }),
  })

export const shipmentsDetailsQueryOptions = (shipmentId: EntityId) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.detail(shipmentId),
    queryFn: () => getShipmentByIdFn({ data: { id: shipmentId } }),
  })

export const shipmentsCompletedQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.completed(),
    queryFn: () =>
      getShipmentsFn({
        data: { ...search, status: ["invoiced", "captured_details", "completed"] },
      }),
  })

export const quotationShipmentsQueryOptions = (
  search: QuotationShipmentSearchParams
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.quotation(search.quotation_id),
    queryFn: () => getShipmentsFn({ data: { ...search } }),
  })
