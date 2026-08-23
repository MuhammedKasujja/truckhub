import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { ShipmentSearchParamsInput } from "./schemas"
import { getShipmentByIdFn, getShipmentsFn } from "./services"

export const shipmentsQueryKeys = {
  all: () => ["shipments"],
  list: () => [...shipmentsQueryKeys.all(), "list"],
  active: () => [...shipmentsQueryKeys.all(), "active"],
  confirmed: () => [...shipmentsQueryKeys.all(), "confirmed"],
  requested: () => [...shipmentsQueryKeys.all(), "requested"],
  completed: () => [...shipmentsQueryKeys.all(), "completed"],
  details: () => [...shipmentsQueryKeys.all(), "detail"],
  search: () => [...shipmentsQueryKeys.all(), "search"],
  detail: (id: EntityId) => [...shipmentsQueryKeys.details(), id],
} as const

export const shipmentsQueryOptions = (search: ShipmentSearchParamsInput) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.list()],
    queryFn: () => getShipmentsFn({ data: search }),
  })

export const shipmentsConfirmedQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.confirmed()],
    queryFn: () => getShipmentsFn({ data: search }),
  })

export const shipmentsActiveQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.active()],
    queryFn: () => getShipmentsFn({ data: search }),
  })

export const shipmentsRequestsQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.requested()],
    queryFn: () => getShipmentsFn({ data: search }),
  })

export const shipmentsDetailsQueryOptions = (shipmentId: EntityId) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.detail(shipmentId)],
    queryFn: () => getShipmentByIdFn({ data: { id: shipmentId } }),
  })

export const shipmentsCompletedQueryOptions = (
  search: ShipmentSearchParamsInput
) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.completed()],
    queryFn: () => getShipmentsFn({ data: search }),
  })
