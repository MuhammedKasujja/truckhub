import { changeClientTypeFn, createClientFn, updateClientFn } from "../services"
import { EntityId } from "@/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { ClientCreateInput, ClientUpdateInput } from "../schemas"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { clientProfileQueryOptions, clientQueryKeys } from "../query-options"

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
    invalidator.clients.profile(input.data.id).invalidate()
  }
)

export function useCreateClient() {
  const { prefill, returnTo, field } = useSearch({
    from: "/_admin/clients/new/",
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { isPending, execute, isSuccess, error } = useCreateClientBase()

  function createClient(input: ClientCreateInput) {
    return execute(
      { data: input },
      {
        onSuccess: (result) => {
          queryClient.setQueryData(
            clientQueryKeys.profile(result.data!.id),
            result
          )
          if (returnTo) {
            const [pathname, qs] = returnTo.split("?")
            const existing = qs
              ? Object.fromEntries(new URLSearchParams(qs))
              : {}
            navigate({
              to: pathname,
              search: {
                ...existing,
                [`created_${field ?? "client"}`]: result.data!.id,
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
  (invalidator, _input) => {
    invalidator.clients.refresh()
    // invalidator.clients.profile(input.data.id).invalidate()
  }
)

export function useChangeClientType() {
  const { isPending, execute, isSuccess, error } = useChangeClientTypeBase()

  function changeClientType(clientId: EntityId) {
    return execute({ data: { id: clientId } })
  }
  return { isLoading: isPending, changeClientType, isSuccess, error }
}

export function useClientProfileQuery(clientId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery(clientProfileQueryOptions(clientId))

  return { data: response?.data, error: error, isLoading }
}
export function useClientProfileSuspenseQuery(clientId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useSuspenseQuery(clientProfileQueryOptions(clientId))

  return { data: response.data!, error, isLoading }
}
