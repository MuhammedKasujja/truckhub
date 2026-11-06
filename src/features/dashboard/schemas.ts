import { z } from "zod"
import {
  differenceInCalendarDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns"

export const dashboardRanges = ["today", "7d", "30d", "mtd", "custom"] as const

export type DashboardRange = (typeof dashboardRanges)[number]

const DATE_FORMAT = "yyyy-MM-dd"

export const DashboardSearchParams = z.object({
  range: z.enum(dashboardRanges).default("30d"),
  /** yyyy-MM-dd, only used when range is "custom" */
  from: z.string().optional(),
  /** yyyy-MM-dd, only used when range is "custom" */
  to: z.string().optional(),
})

export type DashboardSearchParamsInput = z.infer<typeof DashboardSearchParams>

export type ResolvedDashboardPeriod = {
  from: string
  to: string
}

/**
 * Turns a range preset (or custom from/to) into concrete yyyy-MM-dd dates
 * sent to the statistics API.
 */
export function resolveDashboardPeriod(
  { range, from, to }: DashboardSearchParamsInput,
  now: Date = new Date()
): ResolvedDashboardPeriod {
  const today = startOfDay(now)
  let start: Date
  let end: Date = endOfDay(now)

  switch (range) {
    case "today":
      start = today
      break
    case "7d":
      start = subDays(today, 6)
      break
    case "mtd":
      start = startOfMonth(today)
      break
    case "custom":
      start = from ? startOfDay(parseISO(from)) : subDays(today, 29)
      end = to ? endOfDay(parseISO(to)) : end
      break
    case "30d":
    default:
      start = subDays(today, 29)
  }

  return { from: format(start, DATE_FORMAT), to: format(end, DATE_FORMAT) }
}

export const dashboardRangeLabels: Record<DashboardRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  mtd: "Month to date",
  custom: "Custom",
}

/** Human label used next to KPI deltas, e.g. "vs previous 30 days". */
export function previousPeriodLabel(period: ResolvedDashboardPeriod) {
  const days =
    differenceInCalendarDays(parseISO(period.to), parseISO(period.from)) + 1
  if (days === 1) return "vs yesterday"
  return `vs previous ${days} days`
}
