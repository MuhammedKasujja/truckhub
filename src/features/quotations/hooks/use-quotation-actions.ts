import { EntityId } from "@/schemas"
import {
  markQuotationExpiredFn,
  markQuotationAcceptedFn,
  markQuotationRejectedFn,
} from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useMarkQuotationAcceptedBase = createEntityActionHook(
  markQuotationAcceptedFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export function useMarkQuotationAccepted() {
  const { isPending, execute } = useMarkQuotationAcceptedBase()

  function markQuotationAccepted(quotationId: EntityId) {
    return execute({ data: { id: quotationId } })
  }
  return { isPending, markQuotationAccepted }
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
