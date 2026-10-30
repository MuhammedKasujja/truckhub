import { Shipment } from "../types"
import { useQuery } from "@tanstack/react-query"
import { shipmentsDetailsQueryOptions } from "../query-options"

export function useShipmentDetails(placeholder: Shipment | undefined) {
  const { isLoading, data, error, isFetching } = useQuery({
    ...shipmentsDetailsQueryOptions(placeholder?.id),
    enabled: !!placeholder,
    placeholderData: placeholder
    // placeholderData: () => {
    //   const queries = queryClient.getQueriesData<Shipment[]>({
    //     queryKey: queryKeys.shipments.list(),
    //   })
    //   console.log(queries)
    //   // for (const [, data] of queries) {
    //   //   const match = data?.find((s) => s.id === shipment?.id)
    //   //   if (match) return match
    //   // }
    //   return undefined
    // },
  })

  return { isLoading, shipment: data, error, isFetching }
}
