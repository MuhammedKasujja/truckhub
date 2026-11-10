import { formatNumber } from "@/lib/format"

/** "6–10 hrs" */
export function formatHoursRange(min: number, max: number) {
  return `${formatNumber(min, { fallback: "0" })}–${formatNumber(max, { fallback: "0" })} hrs`
}

/** "1–2 days" once the window reaches a day, otherwise undefined. */
export function formatDaysHint(min: number, max: number) {
  if (max < 24) return undefined
  const days = (hrs: number) => formatNumber(Math.round((hrs / 24) * 10) / 10, { fallback: "0" })
  const from = days(min)
  const to = days(max)
  if (from === to) return `about ${to} ${to === "1" ? "day" : "days"}`
  return `about ${from}–${to} days`
}
