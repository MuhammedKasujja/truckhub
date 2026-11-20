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
