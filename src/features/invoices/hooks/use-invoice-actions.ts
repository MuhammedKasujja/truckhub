import { EntityId } from "@/schemas"
import { VoidInvoiceInput } from "../schemas"
import { sendInvoiceEmailFn, voidInvoiceFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useSendInvoiceEmailBase = createEntityActionHook(
  sendInvoiceEmailFn,
  (invalidator, input) => {
    invalidator.invoices.list.invalidate()
    invalidator.invoices.details(input.data.id)
  }
)

export const useSendInvoiceEmail = () => {
  const { isPending, execute } = useSendInvoiceEmailBase()

  function sendInvoiceEmail(invoiceId: EntityId) {
    return execute({ data: { id: invoiceId } })
  }
  return { isPending, sendInvoiceEmail }
}

const useVoidInvoiceBase = createEntityActionHook(
  voidInvoiceFn,
  (invalidator, input) => {
    invalidator.invoices.list.invalidate()
    invalidator.invoices.details(input.data.invoiceId)
    // Its payments became client credit, its shipments can be invoiced again
    // and its quotation is no longer (fully) invoiced
    invalidator.payments.list()
    invalidator.quotations.all.invalidate()
    invalidator.shipments.all.invalidate()
  }
)

export const useVoidInvoice = () => {
  const { isPending, execute } = useVoidInvoiceBase()

  function voidInvoice(data: VoidInvoiceInput) {
    return execute({ data })
  }
  return { isPending, voidInvoice }
}
