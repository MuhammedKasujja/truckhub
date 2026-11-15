import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { hrQueryKeys } from "./query-options"
import type { ApiResponse } from "@/types"

/**
 * Runs an HR change, shows the API's message, and refreshes every HR query
 * on success. `onDone` is the place to close a dialog or navigate.
 */
export function useHrAction<TInput, TData>(
  action: (input: TInput) => Promise<ApiResponse<TData>>,
  options: {
    fallbackError?: string
    onDone?: (data: TData | undefined, input: TInput) => void
  } = {}
) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: action,
    onSuccess: (result, input) => {
      if (!result.isSuccess) {
        toast.error(
          result.error?.message ?? options.fallbackError ?? "Something went wrong"
        )
        return
      }
      if (result.message) toast.success(result.message)
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.all() })
      options.onDone?.(result.data, input)
    },
    onError: (error) =>
      toast.error(error.message || options.fallbackError || "Something went wrong"),
  })

  return {
    run: mutation.mutate,
    runAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
