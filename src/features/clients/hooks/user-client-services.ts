import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { createClientServiceFn } from "../services"
import { ClientServiceCreateInput } from "../schemas"
import { clientServiceProductsQueryOptions } from "../query-options"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

export function useClientServiceProducts(clientId: EntityId) {
  const { data, isLoading } = useQuery(
    clientServiceProductsQueryOptions(clientId)
  )

  return { isLoading, data: data?.data, error: data?.error }
}

const useCreateClientServiceBase = createEntityActionHook(
  createClientServiceFn,
  (invalidator, iput) => {
    invalidator.clients.profile(iput.data.clientId).invalidate()
  }
)

export function useCreateClientService() {
  const { isPending, execute, isSuccess, error } = useCreateClientServiceBase()

  function createClientService(data: ClientServiceCreateInput) {
    return execute({ data })
  }
  return { isLoading: isPending, createClientService, isSuccess, error }
}
