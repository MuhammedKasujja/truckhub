import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { ShipmentStatus } from "@/features/shipments/enums"
import { quotationShipmentsQueryOptions } from "../query-options"

export function useQuotationShipments(
  quotationId: EntityId | undefined,
  status?: { status: ShipmentStatus }
) {
  const { isLoading, data, error } = useQuery({
    ...quotationShipmentsQueryOptions({
      page: 1,
      perPage: 20,
      sort: [],
      quotation_id: quotationId!,
      status: status?.status,
    }),
    enabled: !!quotationId,
  })

  return { isLoading, data, error }
}

export function useQuotationCompletedShipments(
  quotationId: EntityId | undefined
) {
  return useQuotationShipments(quotationId, { status: "captured_details" })
}
