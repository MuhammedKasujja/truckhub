import { useQuery } from "@tanstack/react-query"
import {
  shipmentsCompletedQueryOptions,
} from "../query-options"

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
