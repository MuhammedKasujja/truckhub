import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { shipmentsDetailsQueryOptions } from "../query-options"

export function useShipmentDetails(shipmentId?: EntityId) {
  const { isLoading, data, error, isFetching } = useQuery({
    ...shipmentsDetailsQueryOptions(shipmentId!),
    enabled: !!shipmentId,
  })

  return { isLoading, shipment: data?.data, error, isFetching }
}
