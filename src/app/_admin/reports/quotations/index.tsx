import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircleIcon,
  FileTextIcon,
  RepeatIcon,
  ScaleIcon,
  SigmaIcon,
} from "lucide-react"
import type { QuotationReport } from "@/features/reports/types"
import type { ReportColumn } from "@/features/reports/components"
import type { QuotationStatus } from "@/features/quotations/enums"
import { requirePermission } from "@/lib/auth"
import { formatMoney } from "@/lib/format"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { KpiCard } from "@/features/dashboard/components"
import { useReport } from "@/features/reports/hooks/use-report"
import { reportQueryOptions } from "@/features/reports/query-options"
import {
  ReportSearchParams,
  resolveReportPeriod,
} from "@/features/reports/schemas"
import {
  compactMoney,
  formatCount,
  formatPercent,
  humanize,
} from "@/features/reports/format"
import {
  ReportBreakdown,
  ReportKpiGrid,
  ReportPage,
  ReportSkeleton,
  ReportTable,
  ReportTrendChart,
} from "@/features/reports/components"

export const Route = createFileRoute("/_admin/reports/quotations/")({
  validateSearch: ReportSearchParams,
  beforeLoad: () => requirePermission("reports:quotations:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      reportQueryOptions("quotations", resolveReportPeriod(search))
    ),
  pendingComponent: ReportSkeleton,
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
})

const statusColors: Record<QuotationStatus, string> = {
  accepted: "var(--success)",
  invoiced: "var(--chart-2)",
  sent: "var(--primary)",
  rejected: "var(--destructive)",
  expired: "var(--warning)",
  draft: "var(--muted-foreground)",
}

const winRateCell = (rate: number) => (
  <span
    className={
      rate >= 50 ? "text-success" : rate < 25 ? "text-destructive" : undefined
    }
  >
    {formatPercent(rate)}
  </span>
)

type ClientRow = QuotationReport["by_client"][number]
type ServiceRow = QuotationReport["by_service"][number]

const clientColumns: ReportColumn<ClientRow>[] = [
  {
    id: "client",
    header: "Client",
    value: (r) => r.client.name,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.client.name}</span>
        <span className="text-xs text-muted-foreground">{r.client.number}</span>
      </div>
    ),
  },
  {
    id: "quotation_count",
    header: "Quotes",
    align: "end",
    value: (r) => Number(r.quotation_count),
    cell: (r) => formatCount(r.quotation_count),
  },
  {
    id: "quoted_value",
    header: "Quoted value",
    align: "end",
    value: (r) => Number(r.quoted_value),
    cell: (r) => formatMoney(r.quoted_value),
  },
  {
    id: "accepted_count",
    header: "Won",
    align: "end",
    value: (r) => Number(r.accepted_count),
    cell: (r) => formatCount(r.accepted_count),
  },
  {
    id: "win_rate",
    header: "Win rate",
    align: "end",
    value: (r) => Math.round(Number(r.win_rate)),
    cell: (r) => winRateCell(Number(r.win_rate)),
  },
]

const serviceColumns: ReportColumn<ServiceRow>[] = [
  {
    id: "service",
    header: "Service",
    value: (r) => r.service.name,
    cell: (r) => <span className="font-medium">{r.service.name}</span>,
  },
  {
    id: "line_items",
    header: "Line items",
    align: "end",
    value: (r) => Number(r.line_items),
    cell: (r) => formatCount(r.line_items),
  },
  {
    id: "quoted_value",
    header: "Quoted value",
    align: "end",
    value: (r) => Number(r.quoted_value),
    cell: (r) => formatMoney(r.quoted_value),
  },
  {
    id: "accepted_count",
    header: "Won",
    align: "end",
    value: (r) => Number(r.accepted_count),
    cell: (r) => formatCount(r.accepted_count),
  },
  {
    id: "win_rate",
    header: "Win rate",
    align: "end",
    value: (r) => Math.round(Number(r.win_rate)),
    cell: (r) => winRateCell(Number(r.win_rate)),
  },
]

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const report = useReport("quotations", search)
  const { data, comparisonLabel, periodLabel, period } = report

  return (
    <ReportPage
      title="Quotations report"
      description="Sent, accepted, expired and converted quotes"
      search={search}
      period={period}
      periodLabel={periodLabel}
      preview={report.preview}
      isFetching={report.isFetching}
      error={report.error}
      hasData={!!data}
      onSearchChange={(next) => navigate({ search: next, replace: true })}
    >
      {data && (
        <>
          <ReportKpiGrid>
            <KpiCard
              label="Quoted value"
              value={compactMoney(data.summary.quoted_value.value)}
              kpi={data.summary.quoted_value}
              comparisonLabel={comparisonLabel}
              icon={<SigmaIcon />}
            />
            <KpiCard
              label="Quotations"
              value={formatCount(data.summary.quotation_count.value)}
              kpi={data.summary.quotation_count}
              comparisonLabel={comparisonLabel}
              icon={<FileTextIcon />}
              to="/quotations"
            />
            <KpiCard
              label="Accepted value"
              value={compactMoney(data.summary.accepted_value.value)}
              kpi={data.summary.accepted_value}
              comparisonLabel={comparisonLabel}
              icon={<CheckCircleIcon />}
            />
            <KpiCard
              label="Win rate"
              value={formatPercent(data.summary.win_rate.value)}
              kpi={data.summary.win_rate}
              comparisonLabel={comparisonLabel}
              icon={<RepeatIcon />}
            />
            <KpiCard
              label="Average quote"
              value={compactMoney(data.summary.average_value.value)}
              kpi={data.summary.average_value}
              comparisonLabel={comparisonLabel}
              icon={<ScaleIcon />}
            />
          </ReportKpiGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ReportTrendChart
                title="Quotes created vs accepted"
                description={periodLabel}
                kind="bar"
                data={data.trend}
                formatValue={formatCount}
                series={[
                  { key: "created", label: "Created", color: "var(--chart-2)" },
                  {
                    key: "accepted",
                    label: "Accepted",
                    color: "var(--primary)",
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="By status"
                description={`${formatCount(data.summary.quotation_count.value)} quotations`}
                items={data.by_status.map((s) => ({
                  key: s.status,
                  label: humanize(s.status),
                  value: Number(s.count),
                  display: formatCount(s.count),
                  hint: compactMoney(s.amount),
                  color: statusColors[s.status],
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportTable
              title="Win rate by client"
              rows={data.by_client}
              columns={clientColumns}
              rowKey={(r) => String(r.client.id)}
              defaultSort="quoted_value"
              exportName={`quotations-by-client_${period.from}_${period.to}`}
            />
            <ReportTable
              title="Win rate by service"
              rows={data.by_service}
              columns={serviceColumns}
              rowKey={(r) => String(r.service.id)}
              defaultSort="quoted_value"
              exportName={`quotations-by-service_${period.from}_${period.to}`}
            />
          </div>
        </>
      )}
    </ReportPage>
  )
}
