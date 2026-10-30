import { useQuery } from "@tanstack/react-query"
import {
  shipmentsActiveQueryOptions,
  shipmentsCompletedQueryOptions,
} from "../query-options"
import { ShipmentSearchParamsInput } from "../schemas"

export function useCompletedShipments() {
  const { isLoading, data, error } = useQuery({
    ...shipmentsCompletedQueryOptions({
      page: 1,
      perPage: 20,
      sort: [],
    }),
  })

  return { isLoading, data, error }
}

export function useActiveShipments(params: ShipmentSearchParamsInput) {
  const { isLoading, data, error, refetch, isRefetching } = useQuery(
    shipmentsActiveQueryOptions({ ...params })
  )

  return { isLoading, shipments: data?.data, error, refetch, isRefetching }
}
