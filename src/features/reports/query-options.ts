import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { getReportFn } from "./services"
import type { ApiResponse } from "@/types"
import type { ReportEntity, ReportResponseMap } from "./types"
import type { ResolvedReportPeriod } from "./schemas"

export const reportQueryKeys = {
  all: () => ["reports"] as const,
  entity: (entity: ReportEntity) => [...reportQueryKeys.all(), entity] as const,
  period: (entity: ReportEntity, period: ResolvedReportPeriod) =>
    [...reportQueryKeys.entity(entity), period] as const,
}

export const reportQueryOptions = <TEntity extends ReportEntity>(
  entity: TEntity,
  period: ResolvedReportPeriod
) =>
  queryOptions({
    queryKey: reportQueryKeys.period(entity, period),
    queryFn: () =>
      getReportFn({ data: { entity, ...period } }) as Promise<
        ApiResponse<ReportResponseMap[TEntity]>
      >,
    // Keep showing the last period while a new range loads
    placeholderData: keepPreviousData,
  })
