import { changeClientTypeFn } from "../services"
import { EntityId } from "@/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

export function useEditClientDetails() {}

const useChangeClientTypeBase = createEntityActionHook(
  changeClientTypeFn,
  (invalidator, input) => {
    invalidator.clients.list.invalidate()
    invalidator.clients.details(input.data.id)
  }
)

export function useChangeClientType() {
  const { isPending, execute, isSuccess, error} = useChangeClientTypeBase()

  function changeClientType(clientId: EntityId) {
    return execute({ data:{ id: clientId } })
  }
  return { isLoading:isPending, changeClientType, isSuccess, error }
}
