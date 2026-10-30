import { createInvoiceFn } from "../services"
import { InvoiceCreateInput } from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useEditInvoiceBase = createEntityActionHook(
  createInvoiceFn,
  (invalidator, _) => {
    invalidator.invoices.list.invalidate()
  }
)

export const useCreateInvoice = () => {
  const { isPending, execute } = useEditInvoiceBase()

  function createInvoice(data: InvoiceCreateInput) {
    return execute({ data })
  }

  return { isPending, createInvoice }
}
