export const invoiceStatuses = [
  "draft",
  "paid",
  "unpaid",
  "partially_paid",
  "refunded",
  "cancelled",
  "voided",
] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]