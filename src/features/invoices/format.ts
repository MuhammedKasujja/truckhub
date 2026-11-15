import type { InvoiceActivityType } from "./enums"
import type { InvoiceActivity } from "./types"
import type { ActivityMeta } from "@/components/activity-timeline"
import { formatMoney } from "@/lib/format"

export const INVOICE_ACTIVITY_META: Record<InvoiceActivityType, ActivityMeta> =
  {
    created: { label: "Created", tone: "default" },
    sent: { label: "Emailed to the client", tone: "info" },
    resent: { label: "Emailed again", tone: "info" },
    email_failed: { label: "Email could not be sent", tone: "error" },
    payment_recorded: { label: "Payment recorded", tone: "success" },
    payment_reversed: { label: "Payment reversed", tone: "warning" },
    voided: { label: "Voided", tone: "error" },
  }

const text = (value: unknown) =>
  value === null || value === undefined || value === "" ? null : String(value)

/** The extra line under an invoice activity, when it has something to add. */
export const describeInvoiceActivity = (entry: InvoiceActivity) => {
  const { details } = entry
  const amount = text(details.amount)
  const reason = text(details.reason)

  switch (entry.type) {
    case "payment_recorded":
    case "payment_reversed": {
      const parts = [
        amount && formatMoney(amount),
        text(details.payment_number),
        entry.type === "payment_reversed" ? reason : null,
      ].filter(Boolean)
      return parts.length ? parts.join(" · ") : null
    }
    case "voided":
      return reason
    case "email_failed":
      return text(details.error)
    default:
      return null
  }
}
