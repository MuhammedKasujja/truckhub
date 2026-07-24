import { toast } from "sonner"
import { EntityId } from "@/schemas"
import { useMutation } from "@tanstack/react-query"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  markQuotationExpiredFn,
  markQuotationAcceptedFn,
  markQuotationRejectedFn,
} from "../services"

export function useMarkQuotationAccepted() {
  const invalidator = useQueryInvalidator()

  const { isPending, mutate } = useMutation({
    mutationFn: markQuotationAcceptedFn,
    onSuccess: ({ message }) => {
      invalidator.quotations.list.invalidate()
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function markQuotationAccepted(quotationId: EntityId) {
    return mutate({ data: { id: quotationId } })
  }

  return { isPending, markQuotationAccepted }
}

export function useMarkQuotationExpired() {
  const invalidator = useQueryInvalidator()

  const { isPending, mutate } = useMutation({
    mutationFn: markQuotationExpiredFn,
    onSuccess: ({ message }) => {
      invalidator.quotations.list.invalidate()
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function markQuotationExpired(quotationId: EntityId) {
    return mutate({ data: { id: quotationId } })
  }

  return { isPending, markQuotationExpired }
}

export function useMarkQuotationRejected() {
  const invalidator = useQueryInvalidator()

  const { isPending, mutate } = useMutation({
    mutationFn: markQuotationRejectedFn,
    onSuccess: ({ message }) => {
      invalidator.quotations.list.invalidate()
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function markQuotationRejected(quotationId: EntityId) {
    return mutate({ data: { id: quotationId } })
  }

  return { isPending, markQuotationRejected }
}
