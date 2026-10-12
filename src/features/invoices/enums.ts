export const invoiceStatuses = [
  "draft",
  "paid",
  "unpaid",
  "partial",
  "refunded",
  "cancelled",
  "voided",
] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]