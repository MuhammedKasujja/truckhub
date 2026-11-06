import { createFileRoute } from "@tanstack/react-router"
import {
  BanknoteIcon,
  ClockIcon,
  ReceiptIcon,
  TimerIcon,
  WalletIcon,
} from "lucide-react"
import type {
  InvoiceAgingBucket,
  InvoiceReport,
} from "@/features/reports/types"
import type { ReportColumn } from "@/features/reports/components"
import type { InvoiceStatus } from "@/features/invoices/enums"
import { requirePermission } from "@/lib/auth"
import { formatMoney } from "@/lib/format"
import { useTranslation } from "@/i18n"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { KpiCard } from "@/features/dashboard/components"
import { useReport } from "@/features/reports/hooks/use-report"
import { reportQueryOptions } from "@/features/reports/query-options"
import {
  ReportSearchParams,
  resolveReportPeriod,
} from "@/features/reports/schemas"
import { compactMoney, formatCount } from "@/features/reports/format"
import {
  ReportBreakdown,
  ReportKpiGrid,
  ReportPage,
  ReportSkeleton,
  ReportTable,
  ReportTrendChart,
} from "@/features/reports/components"

export const Route = createFileRoute("/_admin/reports/invoices/")({
  validateSearch: ReportSearchParams,
  beforeLoad: () => requirePermission("reports:invoices:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      reportQueryOptions("invoices", resolveReportPeriod(search))
    ),
  pendingComponent: ReportSkeleton,
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
})

const statusColors: Partial<Record<InvoiceStatus, string>> = {
  paid: "var(--success)",
  partially_paid: "var(--info)",
  issued: "var(--primary)",
  mailed: "var(--primary)",
  over_due: "var(--destructive)",
  draft: "var(--muted-foreground)",
}

const agingLabels: Record<InvoiceAgingBucket, string> = {
  current: "Not yet due",
  "1_30": "1–30 days",
  "31_60": "31–60 days",
  "61_90": "61–90 days",
  "90_plus": "90+ days",
}

const agingColors: Record<InvoiceAgingBucket, string> = {
  current: "var(--success)",
  "1_30": "var(--info)",
  "31_60": "var(--warning)",
  "61_90": "var(--destructive)",
  "90_plus": "var(--destructive)",
}

type ClientRow = InvoiceReport["by_client"][number]

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
    id: "invoice_count",
    header: "Invoices",
    align: "end",
    value: (r) => Number(r.invoice_count),
    cell: (r) => formatCount(r.invoice_count),
  },
  {
    id: "invoiced",
    header: "Invoiced",
    align: "end",
    value: (r) => Number(r.invoiced),
    cell: (r) => formatMoney(r.invoiced),
  },
  {
    id: "collected",
    header: "Collected",
    align: "end",
    value: (r) => Number(r.collected),
    cell: (r) => formatMoney(r.collected),
  },
  {
    id: "outstanding",
    header: "Outstanding",
    align: "end",
    value: (r) => Number(r.outstanding),
    cell: (r) => (
      <span
        className={Number(r.outstanding) > 0 ? "text-destructive" : undefined}
      >
        {formatMoney(r.outstanding)}
      </span>
    ),
  },
  {
    id: "collection_rate",
    header: "Collected %",
    align: "end",
    value: (r) =>
      Number(r.invoiced)
        ? Math.round((Number(r.collected) / Number(r.invoiced)) * 100)
        : 0,
    cell: (r) =>
      `${Number(r.invoiced) ? Math.round((Number(r.collected) / Number(r.invoiced)) * 100) : 0}%`,
  },
]

function RouteComponent() {
  const tr = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const report = useReport("invoices", search)
  const { data, comparisonLabel, periodLabel } = report

  return (
    <ReportPage
      title="Invoices report"
      description="Issued, paid, pending and overdue invoices"
      search={search}
      period={report.period}
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
              label="Invoiced"
              value={compactMoney(data.summary.invoiced.value)}
              kpi={data.summary.invoiced}
              comparisonLabel={comparisonLabel}
              icon={<ReceiptIcon />}
            />
            <KpiCard
              label="Collected"
              value={compactMoney(data.summary.collected.value)}
              kpi={data.summary.collected}
              comparisonLabel={comparisonLabel}
              icon={<BanknoteIcon />}
            />
            <KpiCard
              label="Outstanding"
              value={compactMoney(data.summary.outstanding.value)}
              kpi={data.summary.outstanding}
              invertTrend
              comparisonLabel={comparisonLabel}
              description={
                data.summary.outstanding.count !== undefined
                  ? `${data.summary.outstanding.count} unpaid invoices`
                  : undefined
              }
              icon={<WalletIcon />}
              to="/invoices"
              search={{ status: ["issued", "partially_paid", "over_due"] }}
            />
            <KpiCard
              label="Overdue"
              value={compactMoney(data.summary.overdue.value)}
              kpi={data.summary.overdue}
              invertTrend
              comparisonLabel={comparisonLabel}
              icon={<ClockIcon />}
              to="/invoices"
              search={{ status: ["over_due"] }}
            />
            {data.summary.average_days_to_pay ? (
              <KpiCard
                label="Avg. days to pay"
                value={`${Math.round(data.summary.average_days_to_pay.value)} days`}
                kpi={data.summary.average_days_to_pay}
                invertTrend
                comparisonLabel={comparisonLabel}
                icon={<TimerIcon />}
              />
            ) : (
              <KpiCard
                label="Invoices"
                value={formatCount(data.summary.invoice_count.value)}
                kpi={data.summary.invoice_count}
                comparisonLabel={comparisonLabel}
                icon={<ReceiptIcon />}
              />
            )}
          </ReportKpiGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ReportTrendChart
                title="Invoiced vs collected"
                description={periodLabel}
                data={data.trend}
                formatValue={formatMoney}
                series={[
                  {
                    key: "invoiced",
                    label: "Invoiced",
                    color: "var(--chart-2)",
                    dashed: true,
                  },
                  {
                    key: "collected",
                    label: "Collected",
                    color: "var(--primary)",
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="Receivables aging"
                description="Unpaid balances by days past due"
                items={data.aging.map((a) => ({
                  key: a.bucket,
                  label: agingLabels[a.bucket],
                  value: Number(a.amount),
                  display: compactMoney(a.amount),
                  hint: `${a.count} invoices`,
                  color: agingColors[a.bucket],
                }))}
                emptyText="No unpaid invoices"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="By status"
                description={`${formatCount(data.summary.invoice_count.value)} invoices`}
                items={data.by_status.map((s) => ({
                  key: s.status,
                  label: tr(`invoices.statuses.${s.status}`),
                  value: Number(s.amount),
                  display: compactMoney(s.amount),
                  hint: `${s.count} invoices`,
                  color: statusColors[s.status] ?? "var(--muted-foreground)",
                  to: "/invoices",
                  search: { status: [s.status] },
                }))}
              />
            </div>
            <div className="lg:col-span-8">
              <ReportTable
                title="By client"
                description="Invoiced, collected and outstanding per client"
                rows={data.by_client}
                columns={clientColumns}
                rowKey={(r) => String(r.client.id)}
                defaultSort="invoiced"
                exportName={`invoices-by-client_${report.period.from}_${report.period.to}`}
              />
            </div>
          </div>
        </>
      )}
    </ReportPage>
  )
}
