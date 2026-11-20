import { createFileRoute } from "@tanstack/react-router"
import {
  BanknoteIcon,
  CoinsIcon,
  HashIcon,
  HourglassIcon,
  Undo2Icon,
} from "lucide-react"
import type { PaymentReport } from "@/features/reports/types"
import type { ReportColumn } from "@/features/reports/components"
import type { PaymentMode, PaymentStatus } from "@/features/payments/types"
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

export const Route = createFileRoute("/_admin/reports/payments/")({
  validateSearch: ReportSearchParams,
  beforeLoad: () => requirePermission("reports:payments:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      reportQueryOptions("payments", resolveReportPeriod(search))
    ),
  pendingComponent: ReportSkeleton,
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
})

const methodColors: Record<PaymentMode, string> = {
  bank_transfer: "var(--chart-1)",
  mobile_money: "var(--chart-2)",
  cash: "var(--chart-3)",
  credit_card: "var(--chart-4)",
}

const statusColors: Record<PaymentStatus, string> = {
  completed: "var(--success)",
  pending: "var(--warning)",
  partially_refunded: "var(--info)",
  reversed: "var(--destructive)",
  cancelled: "var(--muted-foreground)",
  failed: "var(--destructive)",
}

type ClientRow = PaymentReport["by_client"][number]

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
    id: "payment_count",
    header: "Payments",
    align: "end",
    value: (r) => Number(r.payment_count),
    cell: (r) => formatCount(r.payment_count),
  },
  {
    id: "amount",
    header: "Collected",
    align: "end",
    value: (r) => Number(r.amount),
    cell: (r) => formatMoney(r.amount),
  },
  {
    id: "outstanding_balance",
    header: "Outstanding balance",
    align: "end",
    value: (r) => Number(r.outstanding_balance),
    cell: (r) => (
      <span
        className={
          Number(r.outstanding_balance) > 0 ? "text-destructive" : undefined
        }
      >
        {formatMoney(r.outstanding_balance)}
      </span>
    ),
  },
]

function RouteComponent() {
  const tr = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const report = useReport("payments", search)
  const { data, comparisonLabel, periodLabel, period } = report

  return (
    <ReportPage
      title="Payments report"
      description="Collections by method and date, reconciled against invoices"
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
              label="Collected"
              value={compactMoney(data.summary.collected.value)}
              kpi={data.summary.collected}
              comparisonLabel={comparisonLabel}
              icon={<BanknoteIcon />}
              to="/payments"
            />
            <KpiCard
              label="Payments"
              value={formatCount(data.summary.payment_count.value)}
              kpi={data.summary.payment_count}
              comparisonLabel={comparisonLabel}
              icon={<HashIcon />}
            />
            <KpiCard
              label="Average payment"
              value={compactMoney(data.summary.average_payment.value)}
              kpi={data.summary.average_payment}
              comparisonLabel={comparisonLabel}
              icon={<CoinsIcon />}
            />
            <KpiCard
              label="Unapplied"
              value={compactMoney(data.summary.unapplied.value)}
              kpi={data.summary.unapplied}
              invertTrend
              comparisonLabel={comparisonLabel}
              icon={<HourglassIcon />}
            />
            <KpiCard
              label="Refunded"
              value={compactMoney(data.summary.refunded.value)}
              kpi={data.summary.refunded}
              invertTrend
              comparisonLabel={comparisonLabel}
              icon={<Undo2Icon />}
            />
          </ReportKpiGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ReportTrendChart
                title="Collections over time"
                description={periodLabel}
                data={data.trend}
                formatValue={formatMoney}
                series={[
                  {
                    key: "amount",
                    label: "Collected",
                    color: "var(--primary)",
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="By method"
                items={data.by_method.map((m) => ({
                  key: m.method,
                  label: tr(`payments.methods.${m.method}`),
                  value: Number(m.amount),
                  display: compactMoney(m.amount),
                  hint: `${m.count} payments`,
                  color: methodColors[m.method],
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="By status"
                items={data.by_status.map((s) => ({
                  key: s.status,
                  label: tr(`payments.statuses.${s.status}`),
                  value: Number(s.count),
                  display: formatCount(s.count),
                  hint: compactMoney(s.amount),
                  color: statusColors[s.status],
                }))}
              />
            </div>
            <div className="lg:col-span-8">
              <ReportTable
                title="By client"
                description="Collections against each client's remaining balance"
                rows={data.by_client}
                columns={clientColumns}
                rowKey={(r) => String(r.client.id)}
                defaultSort="amount"
                exportName={`payments-by-client_${period.from}_${period.to}`}
              />
            </div>
          </div>
        </>
      )}
    </ReportPage>
  )
}
