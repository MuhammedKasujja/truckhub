import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { createQuotationFn, updateQuotationFn } from "../services"
import { CreateQuotationRequest, UpdateQuotationRequest } from "../schemas"

const useEditQuotationBase = createEntityActionHook(
  updateQuotationFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.quotationId)
  }
)

export function useEditQuotation() {
  const { isPending, mutate } = useEditQuotationBase()

  function editQuotation(
    data: UpdateQuotationRequest,
    opts?: Parameters<typeof mutate>[1]
  ) {
    if (isPending) return
    return mutate({ data }, opts)
  }
  return { isPending, editQuotation }
}

const useCreateQuotationBase = createEntityActionHook(
  createQuotationFn,
  (invalidator) => {
    invalidator.quotations.list.invalidate()
  }
)

export function useCreateQuotation() {
  const { isPending, isSuccess, mutate } = useCreateQuotationBase()

  function createQuotation(
    data: CreateQuotationRequest,
    opts?: Parameters<typeof mutate>[1]
  ) {
    if (isPending) return
    return mutate({ data }, opts)
  }
  return { isPending, createQuotation, isSuccess }
}
