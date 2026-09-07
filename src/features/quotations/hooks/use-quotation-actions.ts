import { EntityId } from "@/schemas"
import {
  sendQuotationEmailFn,
  markQuotationExpiredFn,
  markQuotationAcceptedFn,
  markQuotationRejectedFn,
  markQuotationCancelledFn,
} from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useAcceptQuotationBase = createEntityActionHook(
  markQuotationAcceptedFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export function useAcceptQuotation() {
  const { isPending, execute } = useAcceptQuotationBase()

  function acceptQuotation(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, acceptQuotation }
}

const useMarkQuotationExpiredBase = createEntityActionHook(
  markQuotationExpiredFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export function useMarkQuotationExpired() {
  const { isPending, execute } = useMarkQuotationExpiredBase()

  function markQuotationExpired(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, markQuotationExpired }
}

const useMarkQuotationRejectedBase = createEntityActionHook(
  markQuotationRejectedFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export const useMarkQuotationRejected = () => {
  const { isPending, execute } = useMarkQuotationRejectedBase()

  function markQuotationRejected(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, markQuotationRejected }
}

const useSendQuotationEmailBase = createEntityActionHook(
  sendQuotationEmailFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export const useSendQuotationEmail = () => {
  const { isPending, execute } = useSendQuotationEmailBase()

  function sendQuotationEmail(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, sendQuotationEmail }
}

const useMarkQuotationCancelledBase = createEntityActionHook(
  markQuotationCancelledFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export const useMarkQuotationCancelled = () => {
  const { isPending, execute } = useMarkQuotationCancelledBase()

  function markQuotationCancelled(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, markQuotationCancelled }
}
