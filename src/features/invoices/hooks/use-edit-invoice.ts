import { createInvoiceFn } from "../services"
import { InvoiceCreateInput } from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useEditInvoiceBase = createEntityActionHook(
  createInvoiceFn,
  (invalidator, input) => {
    invalidator.invoices.list.invalidate()
    // The shipments are now invoiced and the quotation's status has moved on
    invalidator.quotations.list.invalidate()
    invalidator.quotations.details(input.data.quotationId)
    invalidator.shipments.all.invalidate()
  }
)

export const useCreateInvoice = () => {
  const { isPending, execute } = useEditInvoiceBase()

  function createInvoice(data: InvoiceCreateInput) {
    return execute({ data })
  }

  return { isPending, createInvoice }
}
