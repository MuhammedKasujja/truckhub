import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import {
  QueryInvalidator,
  useQueryInvalidator,
} from "@/hooks/use-query-invalidator"

export function createEntityActionHook<
  TInput,
  TResult extends { message?: string | null },
>(
  mutationFn: (input: TInput) => Promise<TResult>,
  invalidate: (invalidator: QueryInvalidator, input: TInput) => void,
  options?: { mutationKeys: string[] }
) {
  return function useEntityAction() {
    const invalidator = useQueryInvalidator()

    const { isPending, mutateAsync, isSuccess } = useMutation({
      mutationKey: options?.mutationKeys, // Can be used to dedupe/cancel Requests
      mutationFn,
      onSuccess: (result, input) => {
        invalidate(invalidator, input)
        toast.success(result.message)
      },
      onError: (error) => toast.error(error.message ?? "Something went wrong"),
    })

    return { isPending, execute: mutateAsync, isSuccess }
  }
}
