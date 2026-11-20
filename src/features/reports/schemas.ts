import { z } from "zod"
import { reportEntities } from "./types"
import { dashboardRanges } from "@/features/dashboard/schemas"

export {
  resolveDashboardPeriod as resolveReportPeriod,
  previousPeriodLabel,
  dashboardRangeLabels as reportRangeLabels,
} from "@/features/dashboard/schemas"
export type { ResolvedDashboardPeriod as ResolvedReportPeriod } from "@/features/dashboard/schemas"

/** URL search params shared by every report page. */
export const ReportSearchParams = z.object({
  range: z.enum(dashboardRanges).default("30d"),
  /** yyyy-MM-dd, only used when range is "custom" */
  from: z.string().optional(),
  /** yyyy-MM-dd, only used when range is "custom" */
  to: z.string().optional(),
  /** DEV-only: fill missing fields with sample data (see preview-data.ts) */
  preview: z.boolean().optional().default(true),
})

export type ReportSearchParamsInput = z.infer<typeof ReportSearchParams>

export const ReportRequestSchema = z.object({
  entity: z.enum(reportEntities),
  from: z.string(),
  to: z.string(),
})

export type ReportRequest = z.infer<typeof ReportRequestSchema>
