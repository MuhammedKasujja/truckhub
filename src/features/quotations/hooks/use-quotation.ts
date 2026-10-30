import { EntityId } from "@/schemas"
import { quotationDetailsQueryOptions } from "../query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useQuotaionDetailsQuery(quotationId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery(quotationDetailsQueryOptions(quotationId))

  return { data: response?.data, error: error, isLoading }
}
export function useQuotaionDetailsSuspenseQuery(quotationId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useSuspenseQuery(quotationDetailsQueryOptions(quotationId))

  return { data: response.data!, error, isLoading }
}
