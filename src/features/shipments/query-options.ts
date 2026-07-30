import { EntityId } from "@/schemas"
import { getShipmentsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { ShipmentSearchParamsInput } from "./schemas"

export const shipmentsQueryKeys = {
  all: () => ["shipments"],
  list: () => [...shipmentsQueryKeys.all(), "list"],
  details: () => [...shipmentsQueryKeys.all(), "detail"],
  search: () => [...shipmentsQueryKeys.all(), "search"],
  detail: (id: EntityId) => [...shipmentsQueryKeys.details(), id],
} as const

export const shipmentsQueryOptions = (search: ShipmentSearchParamsInput) =>
  queryOptions({
    queryKey: [...shipmentsQueryKeys.list()],
    queryFn: () => getShipmentsFn({ data: search }),
  })

