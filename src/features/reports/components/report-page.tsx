import type { ReportSearchParamsInput, ResolvedReportPeriod } from "../schemas"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { DashboardRangePicker } from "@/features/dashboard/components"
import { Spinner } from "@/components/ui/spinner"

type ReportPageProps = {
  title: string
  description: string
  search: ReportSearchParamsInput
  period: ResolvedReportPeriod
  periodLabel: string
  preview: boolean
  isFetching?: boolean
  /** Shown instead of children when there is nothing to render */
  error?: string
  hasData: boolean
  onSearchChange: (next: ReportSearchParamsInput) => void
  children: React.ReactNode
}

export function ReportPage({
  title,
  description,
  search,
  period,
  periodLabel,
  preview,
  isFetching,
  error,
  hasData,
  onSearchChange,
  children,
}: ReportPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader className="flex-wrap gap-3 pb-0">
        <div className="flex items-start gap-1">
          <PageBackButton />
          <div>
            <PageTitle className="flex items-center gap-2">
              {title}
              {isFetching && (
                <Spinner className="size-4 text-muted-foreground" />
              )}
            </PageTitle>
            <p className="text-sm text-muted-foreground">
              {description} · {periodLabel}
            </p>
          </div>
        </div>
        <PageAction className="flex-wrap">
          <DashboardRangePicker
            search={search}
            period={period}
            onChange={(next) =>
              onSearchChange({ ...next, preview: search.preview })
            }
          />
        </PageAction>
      </PageHeader>

      {preview && (
        <div className="rounded-lg border border-dashed border-info/40 bg-info/10 px-3 py-2 text-xs text-info-foreground">
          Preview mode: fields the reports API doesn't return yet are filled
          with sample data. Add <code>?preview=false</code> to see real data
          only.
        </div>
      )}

      {hasData ? (
        children
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          {error ?? "Could not load this report"}
        </div>
      )}
    </div>
  )
}

export function ReportKpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {children}
    </div>
  )
}
