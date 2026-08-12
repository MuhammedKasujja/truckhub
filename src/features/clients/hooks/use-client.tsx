import { changeClientTypeFn, createClientFn, updateClientFn } from "../services"
import { EntityId } from "@/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { ClientCreateInput, ClientUpdateInput } from "../schemas"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { clientQueryKeys } from "../query-options"

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
  const { prefill, returnTo, field } = useSearch({
    from: "/_admin/clients/new/",
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { isPending, execute, isSuccess, error } = useCreateClientBase()

  function createClient(data: ClientCreateInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data }) => {
          queryClient.setQueryData(clientQueryKeys.profile(data!.id), data)
          if (returnTo) {
            const [pathname, qs] = returnTo.split("?")
            const existing = qs
              ? Object.fromEntries(new URLSearchParams(qs))
              : {}
            navigate({
              to: pathname,
              search: {
                ...existing,
                [`created_${field ?? "client"}`]: data!.id,
              },
            })
          } else {
            navigate({ to: "/clients" })
          }
        },
      }
    )
  }
  return {
    isLoading: isPending,
    createClient,
    isSuccess,
    error,
    prefill: { name: prefill },
  }
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
