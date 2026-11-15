export const invoiceStatuses = [
  "draft",
  "paid",
  "issued",
  "partially_refunded",
  "refunded",
  "cancelled",
  "void",
  "mailed",
  "partially_paid",
  "over_due",
] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]

/** Charged invoices the client still owes money on. */
export const OUTSTANDING_INVOICE_STATUSES = [
  "issued",
  "partially_paid",
  "over_due",
] as const satisfies readonly InvoiceStatus[]

/** Statuses of an invoice that is not (or no longer) charged to the client. */
const NOT_CHARGED: readonly InvoiceStatus[] = ["draft", "cancelled", "void"]

/** A charged invoice: it can be emailed to the client and it can be voided. */
export const isChargedInvoice = (status: InvoiceStatus) =>
  !NOT_CHARGED.includes(status)
