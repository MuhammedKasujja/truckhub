import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { updateQuotationFn } from "../services"
import { UpdateQuotationRequest } from "../schemas"

const useEditQuotationBase = createEntityActionHook(
  updateQuotationFn,
  (invalidator, input) => {
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.id)
  }
)

export function useEditQuotation() {
  const { isPending, execute } = useEditQuotationBase()

  function editQuotation(data: UpdateQuotationRequest) {
    return execute({ data })
  }
  return { isPending, editQuotation }
}
