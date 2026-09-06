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
  active: (search: ShipmentSearchParamsInput) => [...shipmentsQueryKeys.list(), "active", search],
  confirmed: (search: ShipmentSearchParamsInput) => [...shipmentsQueryKeys.list(), "confirmed", search],
  requested: (search: ShipmentSearchParamsInput) => [...shipmentsQueryKeys.list(), "requested", search],
  completed: (search: ShipmentSearchParamsInput) => [...shipmentsQueryKeys.list(), "completed", search],
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
    queryKey: shipmentsQueryKeys.confirmed(search),
    queryFn: () =>
      getShipmentsFn({
        data: { ...search, status: ["assigned", "vehicle_assigned"] },
      }),
  })

export const shipmentsActiveQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.active(search),
    queryFn: () =>
      getShipmentsFn({
        data: { ...search, status: ["in_progress", "dispatched", "delayed"] },
      }),
  })

export const shipmentsRequestsQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: shipmentsQueryKeys.requested(search),
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
    queryKey: shipmentsQueryKeys.completed(search),
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
