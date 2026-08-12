import { changeClientTypeFn, createClientFn, updateClientFn } from "../services"
import { EntityId } from "@/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { ClientCreateInput, ClientUpdateInput } from "../schemas"

const useCreateClientBase = createEntityActionHook(
  createClientFn,
  (invalidator) => {
    invalidator.clients.list.invalidate()
  }
)

const useEditClientBase = createEntityActionHook(
  updateClientFn,
  (invalidator, input) => {
    invalidator.clients.list.invalidate()
    invalidator.clients.profile(input.data.id)
  }
)

export function useCreateClient() {
  const { isPending, execute, isSuccess, error } = useCreateClientBase()

  function createClient(data: ClientCreateInput) {
    return execute({ data })
  }
  return { isLoading: isPending, createClient, isSuccess, error }
}

export function useEditClient() {
  const { isPending, execute, isSuccess, error } = useEditClientBase()

  function editClient(data: ClientUpdateInput) {
    return execute({ data })
  }
  return { isLoading: isPending, editClient, isSuccess, error }
}

const useChangeClientTypeBase = createEntityActionHook(
  changeClientTypeFn,
  (invalidator, input) => {
    invalidator.clients.list.invalidate()
    invalidator.clients.profile(input.data.id)
  }
)

export function useChangeClientType() {
  const { isPending, execute, isSuccess, error } = useChangeClientTypeBase()

  function changeClientType(clientId: EntityId) {
    return execute({ data: { id: clientId } })
  }
  return { isLoading: isPending, changeClientType, isSuccess, error }
}
