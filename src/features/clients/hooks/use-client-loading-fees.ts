import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { clientLoadingFeesQueryOptions } from "../query-options"
import { createClientLoadingOffloadingPricingFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"

export function useClientLoadingOffloadingFees(clientId: EntityId) {
  const { data, isLoading } = useQuery(clientLoadingFeesQueryOptions(clientId))

  return { isLoading, data: data?.data, error: data?.error }
}

const useCreateClientLoadingFeesBase = createEntityActionHook(
  createClientLoadingOffloadingPricingFn,
  (invalidator, input) => {
    invalidator.clients.list.invalidate()
    invalidator.clients.profile(input.data.client_id!).invalidate()
  }
)

export function useCreateClientLoadingFees() {
  const { isPending, execute, isSuccess, error } =
    useCreateClientLoadingFeesBase()

  function createClientLoadingFees(data: LoadingOffloadingPricingRequest) {
    return execute({ data })
  }
  return {
    isPending,
    createClientLoadingFees,
    isSuccess,
    error,
  }
}
