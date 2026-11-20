import { createFileRoute } from "@tanstack/react-router"
import {
  BanknoteIcon,
  LayersIcon,
  PercentIcon,
  ScaleIcon,
  TagIcon,
} from "lucide-react"
import type { PricingReport } from "@/features/reports/types"
import type { ReportColumn } from "@/features/reports/components"
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
} from "@/features/reports/format"
import {
  ReportBreakdown,
  ReportKpiGrid,
  ReportPage,
  ReportSkeleton,
  ReportTable,
  ReportTrendChart,
} from "@/features/reports/components"

export const Route = createFileRoute("/_admin/reports/pricings/")({
  validateSearch: ReportSearchParams,
  beforeLoad: () => requirePermission("reports:pricings:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      reportQueryOptions("pricings", resolveReportPeriod(search))
    ),
  pendingComponent: ReportSkeleton,
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
})

const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

/** How far the average quoted price sits from the rule's base fare. */
const variance = (r: ServiceRow) =>
  Number(r.base_fare)
    ? ((Number(r.average_unit_price) - Number(r.base_fare)) /
        Number(r.base_fare)) *
      100
    : 0

type ServiceRow = PricingReport["by_service"][number]

const serviceColumns: ReportColumn<ServiceRow>[] = [
  {
    id: "service",
    header: "Service",
    value: (r) => r.service.name,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.service.name}</span>
        {r.service.category && (
          <span className="text-xs text-muted-foreground">
            {r.service.category}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "base_fare",
    header: "Base fare",
    align: "end",
    value: (r) => Number(r.base_fare),
    cell: (r) => formatMoney(r.base_fare),
  },
  {
    id: "min_fare",
    header: "Min fare",
    align: "end",
    value: (r) => Number(r.min_fare),
    cell: (r) => formatMoney(r.min_fare),
  },
  {
    id: "average_unit_price",
    header: "Avg. quoted",
    align: "end",
    value: (r) => Number(r.average_unit_price),
    cell: (r) => formatMoney(r.average_unit_price),
  },
  {
    id: "variance",
    header: "vs base",
    align: "end",
    value: (r) => Math.round(variance(r)),
    cell: (r) => {
      const v = variance(r)
      return (
        <span
          className={
            v < -5 ? "text-destructive" : v > 5 ? "text-success" : undefined
          }
        >
          {v > 0 ? "+" : ""}
          {Math.round(v)}%
        </span>
      )
    },
  },
  {
    id: "average_discount_rate",
    header: "Avg. discount",
    align: "end",
    value: (r) => Math.round(Number(r.average_discount_rate)),
    cell: (r) => formatPercent(r.average_discount_rate),
  },
  {
    id: "quoted_items",
    header: "Quoted",
    align: "end",
    value: (r) => Number(r.quoted_items),
    cell: (r) => formatCount(r.quoted_items),
  },
  {
    id: "revenue",
    header: "Revenue",
    align: "end",
    value: (r) => Number(r.revenue),
    cell: (r) => formatMoney(r.revenue),
  },
]

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const report = useReport("pricings", search)
  const { data, comparisonLabel, periodLabel, period } = report

  return (
    <ReportPage
      title="Pricing report"
      description="Rule usage, quoted vs base fares, and discounting"
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
              label="Rules used"
              value={formatCount(data.summary.rules_used.value)}
              kpi={data.summary.rules_used}
              comparisonLabel={comparisonLabel}
              description={
                data.summary.rules_used.total !== undefined
                  ? `of ${data.summary.rules_used.total} pricing rules`
                  : undefined
              }
              icon={<TagIcon />}
              to="/services"
            />
            <KpiCard
              label="Quoted items"
              value={formatCount(data.summary.quoted_items.value)}
              kpi={data.summary.quoted_items}
              comparisonLabel={comparisonLabel}
              icon={<LayersIcon />}
            />
            <KpiCard
              label="Avg. unit price"
              value={compactMoney(data.summary.average_unit_price.value)}
              kpi={data.summary.average_unit_price}
              comparisonLabel={comparisonLabel}
              icon={<ScaleIcon />}
            />
            <KpiCard
              label="Avg. discount"
              value={formatPercent(data.summary.average_discount_rate.value)}
              kpi={data.summary.average_discount_rate}
              invertTrend
              comparisonLabel={comparisonLabel}
              icon={<PercentIcon />}
            />
            <KpiCard
              label="Priced revenue"
              value={compactMoney(data.summary.revenue.value)}
              kpi={data.summary.revenue}
              comparisonLabel={comparisonLabel}
              icon={<BanknoteIcon />}
            />
          </ReportKpiGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ReportTrendChart
                title="Average quoted unit price"
                description={periodLabel}
                data={data.trend}
                formatValue={formatMoney}
                series={[
                  {
                    key: "average_unit_price",
                    label: "Avg. unit price",
                    color: "var(--primary)",
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="Revenue by vehicle category"
                items={data.by_vehicle_category.map((c, i) => ({
                  key: String(c.category.id),
                  label: c.category.name,
                  value: Number(c.revenue),
                  display: compactMoney(c.revenue),
                  hint: `${c.quoted_items} items · avg ${compactMoney(c.average_unit_price)}`,
                  color: categoryColors[i % categoryColors.length],
                }))}
              />
            </div>
          </div>

          <ReportTable
            title="Pricing rules"
            description="Configured fares against what was actually quoted"
            rows={data.by_service}
            columns={serviceColumns}
            rowKey={(r) => String(r.service.id)}
            defaultSort="revenue"
            exportName={`pricing-rules_${period.from}_${period.to}`}
          />
        </>
      )}
    </ReportPage>
  )
}
