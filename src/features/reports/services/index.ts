import { createServerFn } from "@tanstack/react-start"
import { ReportRequestSchema } from "../schemas"
import { getReport } from "./server"

/**
 * Returns the raw API response (errors included) instead of throwing, so the
 * page can still render preview data while the backend endpoint is missing.
 */
export const getReportFn = createServerFn({ method: "GET" })
  .inputValidator(ReportRequestSchema)
  .handler(async ({ data: { entity, from, to } }) => {
    return getReport(entity, { from, to })
  })
