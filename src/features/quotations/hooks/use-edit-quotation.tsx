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

type Props = {
  onSuccess?: () => void
}

export function useEditQuotation() {
  const { isPending, execute } = useEditQuotationBase()

  function editQuotation(data: UpdateQuotationRequest, { onSuccess }: Props) {
    return execute({ data }, { onSuccess })
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
  const { isPending, execute, isSuccess } = useCreateQuotationBase()

  function editQuotation(data: CreateQuotationRequest, { onSuccess }: Props) {
    return execute({ data }, { onSuccess })
  }
  return { isPending, editQuotation, isSuccess }
}
