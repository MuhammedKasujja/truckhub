import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { clientLoadingFeesQueryOptions } from "../query-options"

export function useClientLoadingOffloadingFees(clientId: EntityId) {
  const { data, isLoading } = useQuery(clientLoadingFeesQueryOptions(clientId))

  return { isLoading, data: data?.data, error: data?.error }
}
