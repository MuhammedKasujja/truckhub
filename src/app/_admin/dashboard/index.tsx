import { parseISO } from "date-fns"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  BanknoteIcon,
  GaugeIcon,
  ReceiptIcon,
  RepeatIcon,
  TruckIcon,
} from "lucide-react"
import type { DashboardKpis } from "@/features/dashboard/types"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { requirePermission } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/format"
import { CURRENCY_CODE } from "@/config/constants"
import { dashboardQueryOptions } from "@/features/dashboard/query-options"
import {
  DashboardSearchParams,
  dashboardRangeLabels,
  previousPeriodLabel,
  resolveDashboardPeriod,
} from "@/features/dashboard/schemas"
import {
  ActionStrip,
  DashboardRangePicker,
  DashboardSkeleton,
  FleetStatusChart,
  KpiCard,
  LiveOperations,
  RecentActivityTabs,
  RevenueChart,
  ShipmentPipeline,
  UpcomingMaintenance,
} from "@/features/dashboard/components"

export const Route = createFileRoute("/_admin/dashboard/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  pendingComponent: DashboardSkeleton,
  validateSearch: DashboardSearchParams,
  beforeLoad: () => requirePermission("dashboard:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      dashboardQueryOptions(resolveDashboardPeriod(search))
    ),
})

const compactCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY_CODE,
  notation: "compact",
  maximumFractionDigits: 1,
})

/** Full amount below 1M, compact (e.g. "UGX 48.2M") above, so KPI cards stay one line. */
const compactMoney = (value: number) =>
  Math.abs(Number(value)) >= 1_000_000
    ? compactCurrency.format(Number(value))
    : formatMoney(value)

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const period = useMemo(() => resolveDashboardPeriod(search), [search])
  const { data: response } = useQuery(dashboardQueryOptions(period))
  const data = response?.data

  const periodLabel =
    search.range === "custom"
      ? `${formatDate(parseISO(period.from))} – ${formatDate(parseISO(period.to))}`
      : dashboardRangeLabels[search.range]
  const comparisonLabel = previousPeriodLabel(period)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader className="flex-wrap gap-3 pb-0">
        <div>
          <PageTitle>Dashboard</PageTitle>
          <p className="text-sm text-muted-foreground">
            Operations overview · {periodLabel}
          </p>
        </div>
        <PageAction className="flex-wrap">
          <DashboardRangePicker
            search={search}
            period={period}
            onChange={(next) => navigate({ search: next, replace: true })}
          />
        </PageAction>
      </PageHeader>

      {!data ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Error loading statistics
        </div>
      ) : (
        <>
          <ActionStrip alerts={data.alerts} />
          <KpiRow kpis={data.kpis} comparisonLabel={comparisonLabel} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Can permission="invoices:view">
              <div className="lg:col-span-8">
                <RevenueChart
                  data={data.revenue_series}
                  periodLabel={periodLabel}
                />
              </div>
            </Can>
            <Can permission="shipments:module">
              <div className="lg:col-span-4">
                <ShipmentPipeline counts={data.shipments_by_status} />
              </div>
            </Can>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Can permission="vehicles:view">
              <FleetStatusChart counts={data.vehicles_by_status} />
            </Can>
            <Can permission="shipments:module">
              <LiveOperations shipments={data.recent_shipments} />
            </Can>
            <Can permission="maintenance:view">
              <UpcomingMaintenance records={data.upcoming_maintenance} />
            </Can>
          </div>

          <RecentActivityTabs data={data} />
        </>
      )}
    </div>
  )
}

/**
 * Headline numbers. Revenue and quote conversion cover the selected period and
 * show a change against the period before; the others describe right now.
 */
function KpiRow({
  kpis,
  comparisonLabel,
}: {
  kpis: DashboardKpis
  comparisonLabel: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <Can permission="invoices:view">
        <KpiCard
          label="Revenue"
          value={compactMoney(kpis.revenue.value)}
          kpi={kpis.revenue}
          comparisonLabel={comparisonLabel}
          icon={<BanknoteIcon />}
          to="/billing/overview"
        />
      </Can>
      <Can permission="shipments:module">
        <KpiCard
          label="Active shipments"
          value={kpis.active_shipments.value}
          kpi={kpis.active_shipments}
          description="On the road now"
          icon={<TruckIcon />}
          to="/shipments/active"
        />
      </Can>
      <Can permission="vehicles:view">
        <KpiCard
          label="Fleet utilisation"
          value={`${Math.round(kpis.fleet_utilization.value)}%`}
          kpi={kpis.fleet_utilization}
          description={`${kpis.fleet_utilization.in_use}/${kpis.fleet_utilization.total} trucks in use`}
          icon={<GaugeIcon />}
          to="/vehicles"
        />
      </Can>
      <Can permission="invoices:view">
        <KpiCard
          label="Outstanding"
          value={compactMoney(kpis.outstanding.value)}
          kpi={kpis.outstanding}
          invertTrend
          description={`${kpis.outstanding.count} unpaid invoice${kpis.outstanding.count === 1 ? "" : "s"}`}
          icon={<ReceiptIcon />}
          to="/invoices"
          search={{ status: ["issued", "partially_paid", "over_due"] }}
        />
      </Can>
      <Can permission="quotations:view">
        <KpiCard
          label="Quote conversion"
          value={`${Math.round(kpis.quote_conversion.value)}%`}
          kpi={kpis.quote_conversion}
          comparisonLabel={comparisonLabel}
          icon={<RepeatIcon />}
          to="/quotations"
        />
      </Can>
    </div>
  )
}
