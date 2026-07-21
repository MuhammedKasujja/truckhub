import { useMutation, useQueryClient } from "@tanstack/react-query"
import { changeClientTypeFn } from "../services"
import { EntityId } from "@/schemas"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { queryKeys } from "@/lib/query-keys"

export function useEditClientDetails() {}

export function useChangeClientType() {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()

  const mutation = useMutation({
    mutationFn: changeClientTypeFn,
    onSuccess: (data) => {
      invalidator.clients.list.invalidate()
    //   if (data.data?.id)
        // console.log(data.data)
        // queryClient.setQueryData(
        //   queryKeys.clients.profile(data.data?.id),
        //   data.data
        // )
    },
  })

  function changeClientType(clientId: EntityId) {
    return mutation.mutate({ data: { id: clientId } })
  }

  return {
    changeClientType,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  }
}
