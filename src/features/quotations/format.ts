import { ACCEPTED_QUOTATION_STATUSES } from "./enums"
import type { QuotationStatus } from "./enums"
import type { QuotationVersion } from "./types"

export type QuotationTone = "success" | "info" | "warning" | "error" | "default"

export const QUOTATION_STATUS_META: Record<
  QuotationStatus,
  { label: string; tone: QuotationTone }
> = {
  draft: { label: "Draft", tone: "default" },
  sent: { label: "Sent", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "error" },
  cancelled: { label: "Cancelled", tone: "default" },
  partially_invoiced: { label: "Partially invoiced", tone: "info" },
  invoiced: { label: "Invoiced", tone: "success" },
  revised: { label: "Revised", tone: "success" },
  expired: { label: "Expired", tone: "warning" },
}

/** Which status actions are allowed; mirrors the quotations table menu. */
export const quotationActions = (status: QuotationStatus) => {
  // Invoicing moves an accepted quotation on to partially_invoiced / invoiced
  const isAccepted = ACCEPTED_QUOTATION_STATUSES.includes(status)
  return {
    accept: !isAccepted,
    reject: !isAccepted && status !== "rejected",
    cancel: status === "accepted",
  }
}

const DAY_MS = 86_400_000

/** Inclusive number of days between two dates (min 1). */
export const periodDays = (start?: string | null, end?: string | null) => {
  if (!start || !end) return null
  const diff = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / DAY_MS
  )
  return Math.max(1, diff + 1)
}

/** Days until `valid_until`; negative once it has passed. */
export const daysUntilDate = (date?: string | null) => {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(date).getTime() - today.getTime()) / DAY_MS)
}

/** The revision to show first: the active one, else the newest. */
export const defaultVersion = (versions: QuotationVersion[]) =>
  versions.find((v) => v.is_active || v.isActive) ??
  [...versions].sort((a, b) => b.version_number - a.version_number).at(0)
