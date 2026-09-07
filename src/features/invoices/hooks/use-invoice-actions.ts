import { EntityId } from "@/schemas"
import { sendInvoiceEmailFn } from "../services"
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
