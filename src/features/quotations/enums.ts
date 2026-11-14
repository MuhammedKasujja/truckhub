export const QuotationStatuses = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "invoiced",
  "revised",
  "expired",
] as const

export type QuotationStatus = (typeof QuotationStatuses)[number]
