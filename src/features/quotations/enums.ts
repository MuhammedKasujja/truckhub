export const QuotationStatuses = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "cancelled",
  "partially_invoiced",
  "invoiced",
  "revised",
  "expired",
] as const

export type QuotationStatus = (typeof QuotationStatuses)[number]

export const quotationActivityTypes = [
  "created",
  "revised",
  "sent",
  "resent",
  "email_failed",
  "accepted",
  "rejected",
  "cancelled",
  "expired",
] as const

export type QuotationActivityType = (typeof quotationActivityTypes)[number]

/** Accepted by the client, whether or not it has been invoiced since. */
export const ACCEPTED_QUOTATION_STATUSES: readonly QuotationStatus[] = [
  "accepted",
  "partially_invoiced",
  "invoiced",
]
