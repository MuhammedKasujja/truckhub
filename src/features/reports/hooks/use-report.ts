import { useMemo } from "react"
import { parseISO } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { reportQueryOptions } from "../query-options"
import { isReportPreviewEnabled, withReportPreview } from "../preview-data"
import {
  previousPeriodLabel,
  reportRangeLabels,
  resolveReportPeriod,
} from "../schemas"
import type { ReportSearchParamsInput } from "../schemas"
import type { ReportEntity } from "../types"
import { formatDate } from "@/lib/format"

export function useReport<TEntity extends ReportEntity>(
  entity: TEntity,
  search: ReportSearchParamsInput
) {
  const period = useMemo(() => resolveReportPeriod(search), [search])
  const query = useQuery(reportQueryOptions(entity, period))

  const preview = isReportPreviewEnabled(search.preview)
  const apiData = query.data?.data
  const data = useMemo(
    () => (preview ? withReportPreview(entity, apiData, period) : apiData),
    [preview, entity, apiData, period]
  )

  const periodLabel =
    search.range === "custom"
      ? `${formatDate(parseISO(period.from))} – ${formatDate(parseISO(period.to))}`
      : reportRangeLabels[search.range]

  return {
    data,
    period,
    preview,
    periodLabel,
    comparisonLabel: previousPeriodLabel(period),
    error: query.data?.error?.message ?? query.error?.message,
    isFetching: query.isFetching,
  }
}
