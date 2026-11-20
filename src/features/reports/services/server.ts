import type { ReportEntity, ReportResponseMap } from "../types"
import type { ResolvedReportPeriod } from "../schemas"
import * as apiClient from "@/lib/api-client"

export async function getReport<TEntity extends ReportEntity>(
  entity: TEntity,
  period: ResolvedReportPeriod
) {
  const params = new URLSearchParams(period).toString()
  return await apiClient.getFn<ReportResponseMap[TEntity]>(
    `/v1/reports/${entity}?${params}`
  )
}
