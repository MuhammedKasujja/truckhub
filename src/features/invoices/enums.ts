export const invoiceStatuses = [
  "draft",
  "paid",
  "unpaid",
  "partially_paid",
] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]