import { Shipment } from "../types"
import { useQuery } from "@tanstack/react-query"
import { shipmentsDetailsQueryOptions } from "../query-options"

export function useShipmentDetails(shipment?: Shipment) {
  const { isLoading, data, error, isFetching } = useQuery({
    ...shipmentsDetailsQueryOptions(shipment?.id!),
    enabled: !!shipment,
    placeholderData: shipment
  })

  return { isLoading, shipment: data, error, isFetching }
}
