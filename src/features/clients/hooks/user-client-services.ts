import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { clientServiceProductsQueryOptions } from "../query-options"

export function useClientServiceProducts(clientId: EntityId) {
  const { data, isLoading } = useQuery(
    clientServiceProductsQueryOptions(clientId)
  )

  return { isLoading, data: data?.data, error: data?.error }
}
