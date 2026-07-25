import { createInvoiceFn } from "../services"
import { InvoiceCreateInput } from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useEditInvoiceBase = createEntityActionHook(
  createInvoiceFn,
  (invalidator, input) => {
    invalidator.invoices.list.invalidate()
    invalidator.invoices.details(input.data.booking_id)
  }
)

export const useCreateInvoice = () => {
  const { isPending, execute } = useEditInvoiceBase()

  function createInvoice(data: InvoiceCreateInput) {
    return execute({ data })
  }

  return { isPending, createInvoice }
}
