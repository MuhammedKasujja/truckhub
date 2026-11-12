import type { LoadingOffloadingPricing } from "../../schemas"

type Bound = string | number | null | undefined

/** "2" / "2.00" → "2"; blank or invalid → "" */
export function formatBound(value: Bound) {
  if (value === null || value === undefined || String(value).trim() === "")
    return ""
  const n = Number(value)
  return Number.isFinite(n) ? String(n) : ""
}

/** 2, 3 → "2 – 3" */
export function formatRange(min: Bound, max: Bound) {
  return `${formatBound(min) || "?"} – ${formatBound(max) || "?"}`
}

/**
 * Pricing dates come back as YYYY-MM-DD. Parse them as local dates so they
 * don't shift a day in timezones behind UTC.
 */
export function formatPricingDate(date: string | undefined) {
  if (!date) return ""
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00`)
    : new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    parsed
  )
}

/** Today as YYYY-MM-DD, the format DatePickerField writes. */
export function todayIsoDate() {
  return new Date().toLocaleDateString("en-CA")
}

export function sortTiers<T extends { tonnage_min: Bound; cbm_min: Bound }>(
  tiers: T[]
) {
  return [...tiers].sort(
    (a, b) =>
      Number(a.tonnage_min) - Number(b.tonnage_min) ||
      Number(a.cbm_min) - Number(b.cbm_min)
  )
}

/** Strips ids / trailing zeros so saved tiers can seed a new version. */
export function toFormTier(tier: LoadingOffloadingPricing) {
  return {
    tonnage_min: formatBound(tier.tonnage_min),
    tonnage_max: formatBound(tier.tonnage_max),
    cbm_min: formatBound(tier.cbm_min),
    cbm_max: formatBound(tier.cbm_max),
    loading_fees: formatBound(tier.loading_fees),
    offloading_fees: formatBound(tier.offloading_fees),
  }
}

/** A blank tier that starts right after the last one (bounds are inclusive). */
export function nextTier(last?: LoadingOffloadingPricing) {
  const after = (value: Bound) => {
    const n = Number(formatBound(value))
    return formatBound(value) === "" ? "" : String(Math.floor(n) + 1)
  }
  return {
    tonnage_min: after(last?.tonnage_max),
    tonnage_max: "",
    cbm_min: after(last?.cbm_max),
    cbm_max: "",
    loading_fees: "",
    offloading_fees: "",
  }
}

/** Starting tiers for a first-ever pricing version. */
export const DEFAULT_TIERS: LoadingOffloadingPricing[] = [
  ["2", "3", "6", "9"],
  ["4", "6", "10", "21"],
  ["7", "8", "22", "32"],
  ["9", "10", "33", "40"],
  ["11", "13", "41", "50"],
  ["14", "18", "51", "60"],
  ["19", "25", "61", "76"],
].map(([tonnage_min, tonnage_max, cbm_min, cbm_max]) => ({
  tonnage_min,
  tonnage_max,
  cbm_min,
  cbm_max,
  loading_fees: "",
  offloading_fees: "",
}))
