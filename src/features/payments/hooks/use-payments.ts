import { useRef } from "react"
import { toast } from "sonner"
import { ApiError } from "@/types"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { PaymentInput } from "@/features/payments/schemas"
import { createPaymentFn } from "@/features/payments/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

export function useCreatePayment() {
  const payFn = useServerFn(createPaymentFn)

  // Created lazily in the handler, never during render, so SSR and
  // hydration can't produce mismatched keys.
  const keyRef = useRef<string | null>(null)
  const inFlight = useRef(false)

  const queryInvalidator = useQueryInvalidator()

  const mutation = useMutation({
    mutationFn: async (input: PaymentInput) => {
      keyRef.current ??= crypto.randomUUID() // stable across retries
      const res = await payFn({
        data: { ...input, idempotencyKey: keyRef.current },
      })
      if (
        res.error &&
        (res.error?.statusCode < 200 || res.error?.statusCode >= 300)
      ) {
        throw new ApiError(JSON.stringify(res.message), res.error.statusCode)
      }
      return res.data!
    },
    retry: (count, err) => {
      const status = err instanceof ApiError ? err.statusCode : undefined
      const retryable = status === undefined || status === 409 || status >= 500
      return retryable && count < 3
    },
    retryDelay: (n) => Math.min(1000 * 2 ** n, 8000),
    onSuccess: (_, input) => {
      keyRef.current = null // next payment gets a fresh key

      // Refresh payments
      queryInvalidator.payments.invalidate({
        entityId: input?.entityId ?? "",
        type: input?.type ?? "invoice",
      })
      toast.success("Payment created successfully")
    },
    onError: (err) => {
      if (err instanceof ApiError && err.statusCode === 422) {
        keyRef.current = null
        toast.success(err.message)
      } else {
        toast.error("Payment failed")
      }
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  const pay = (
    input: PaymentInput,
    opts?: Parameters<typeof mutation.mutate>[1]
  ) => {
    if (inFlight.current || mutation.isPending) return
    inFlight.current = true
    return mutation.mutate(input, opts)
  }

  const resetKey = () => {
    keyRef.current = null // call when amount/currency/card changes
  }

  return { ...mutation, pay, resetKey }
}
