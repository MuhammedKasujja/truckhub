export const invoiceStatuses = [
  "draft",
  "paid",
  "refunded",
  "cancelled",
  "void",
  "mailed",
  "partially_paid",
  "over_due",
] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]