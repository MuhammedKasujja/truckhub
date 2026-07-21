export const QuotationStatuses = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "invoiced",
  "expired",
] as const

export type QuotationStatus = (typeof QuotationStatuses)[number]
