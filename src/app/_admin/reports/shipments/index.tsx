import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircleIcon,
  FuelIcon,
  RouteIcon,
  TimerIcon,
  TruckIcon,
} from "lucide-react"
import type { ShipmentReport } from "@/features/reports/types"
import type { ReportColumn } from "@/features/reports/components"
import type { ShipmentStatus } from "@/features/shipments/enums"
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
import {
  compactMoney,
  formatCompact,
  formatCount,
  formatKm,
  formatLitres,
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

export const Route = createFileRoute("/_admin/reports/shipments/")({
  validateSearch: ReportSearchParams,
  beforeLoad: () => requirePermission("reports:shipments:view"),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(
      reportQueryOptions("shipments", resolveReportPeriod(search))
    ),
  pendingComponent: ReportSkeleton,
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
})

const statusColors: Partial<Record<ShipmentStatus, string>> = {
  completed: "var(--success)",
  invoiced: "var(--chart-2)",
  captured_details: "var(--chart-2)",
  in_progress: "var(--primary)",
  dispatched: "var(--primary)",
  assigned: "var(--info)",
  vehicle_assigned: "var(--info)",
  unassigned: "var(--warning)",
  delayed: "var(--destructive)",
  cancelled: "var(--muted-foreground)",
}

const onTimeCell = (rate: number) => (
  <span
    className={
      rate >= 90 ? "text-success" : rate < 75 ? "text-destructive" : undefined
    }
  >
    {formatPercent(rate)}
  </span>
)

const kmPerLitre = (km: number, litres: number) =>
  litres ? Math.round((km / litres) * 10) / 10 : 0

type LaneRow = ShipmentReport["by_lane"][number]
type DriverRow = ShipmentReport["by_driver"][number]
type VehicleRow = ShipmentReport["by_vehicle"][number]

const laneColumns: ReportColumn<LaneRow>[] = [
  {
    id: "lane",
    header: "Lane",
    value: (r) => `${r.origin} → ${r.destination}`,
    cell: (r) => (
      <span className="font-medium">
        {r.origin} <span className="text-muted-foreground">→</span>{" "}
        {r.destination}
      </span>
    ),
  },
  {
    id: "trips",
    header: "Trips",
    align: "end",
    value: (r) => Number(r.trips),
    cell: (r) => formatCount(r.trips),
  },
  {
    id: "distance_km",
    header: "Distance",
    align: "end",
    value: (r) => Number(r.distance_km),
    cell: (r) => formatKm(r.distance_km),
  },
  {
    id: "fuel_cost",
    header: "Fuel cost",
    align: "end",
    value: (r) => Number(r.fuel_cost),
    cell: (r) => formatMoney(r.fuel_cost),
  },
  {
    id: "cost_per_trip",
    header: "Fuel / trip",
    align: "end",
    value: (r) =>
      Number(r.trips) ? Math.round(Number(r.fuel_cost) / Number(r.trips)) : 0,
    cell: (r) =>
      formatMoney(
        Number(r.trips) ? Math.round(Number(r.fuel_cost) / Number(r.trips)) : 0
      ),
  },
  {
    id: "on_time_rate",
    header: "On time",
    align: "end",
    value: (r) => Math.round(Number(r.on_time_rate)),
    cell: (r) => onTimeCell(Number(r.on_time_rate)),
  },
]

const driverColumns: ReportColumn<DriverRow>[] = [
  {
    id: "driver",
    header: "Driver",
    value: (r) => r.driver.fullname,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.driver.fullname}</span>
        <span className="text-xs text-muted-foreground">{r.driver.number}</span>
      </div>
    ),
  },
  {
    id: "trips",
    header: "Trips",
    align: "end",
    value: (r) => Number(r.trips),
    cell: (r) => formatCount(r.trips),
  },
  {
    id: "distance_km",
    header: "Distance",
    align: "end",
    value: (r) => Number(r.distance_km),
    cell: (r) => formatKm(r.distance_km),
  },
  {
    id: "on_time_rate",
    header: "On time",
    align: "end",
    value: (r) => Math.round(Number(r.on_time_rate)),
    cell: (r) => onTimeCell(Number(r.on_time_rate)),
  },
]

const vehicleColumns: ReportColumn<VehicleRow>[] = [
  {
    id: "vehicle",
    header: "Vehicle",
    value: (r) => r.vehicle.plate_number,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.vehicle.plate_number}</span>
        <span className="text-xs text-muted-foreground">
          {r.vehicle.number}
        </span>
      </div>
    ),
  },
  {
    id: "trips",
    header: "Trips",
    align: "end",
    value: (r) => Number(r.trips),
    cell: (r) => formatCount(r.trips),
  },
  {
    id: "distance_km",
    header: "Distance",
    align: "end",
    value: (r) => Number(r.distance_km),
    cell: (r) => formatKm(r.distance_km),
  },
  {
    id: "fuel_litres",
    header: "Fuel",
    align: "end",
    value: (r) => Number(r.fuel_litres),
    cell: (r) => formatLitres(r.fuel_litres),
  },
  {
    id: "km_per_litre",
    header: "km / L",
    align: "end",
    value: (r) => kmPerLitre(Number(r.distance_km), Number(r.fuel_litres)),
    cell: (r) => kmPerLitre(Number(r.distance_km), Number(r.fuel_litres)),
  },
  {
    id: "fuel_cost",
    header: "Fuel cost",
    align: "end",
    value: (r) => Number(r.fuel_cost),
    cell: (r) => formatMoney(r.fuel_cost),
  },
]

function RouteComponent() {
  const tr = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const report = useReport("shipments", search)
  const { data, comparisonLabel, periodLabel, period } = report

  return (
    <ReportPage
      title="Shipments report"
      description="Trips, distance, fuel and on-time performance"
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
              label="Shipments"
              value={formatCount(data.summary.shipments.value)}
              kpi={data.summary.shipments}
              comparisonLabel={comparisonLabel}
              description={`${formatCount(data.summary.completed.value)} completed`}
              icon={<TruckIcon />}
            />
            <KpiCard
              label="Completed"
              value={formatCount(data.summary.completed.value)}
              kpi={data.summary.completed}
              comparisonLabel={comparisonLabel}
              icon={<CheckCircleIcon />}
            />
            <KpiCard
              label="On-time rate"
              value={formatPercent(data.summary.on_time_rate.value)}
              kpi={data.summary.on_time_rate}
              comparisonLabel={comparisonLabel}
              icon={<TimerIcon />}
            />
            <KpiCard
              label="Distance"
              value={`${formatCompact(data.summary.distance_km.value)} km`}
              kpi={data.summary.distance_km}
              comparisonLabel={comparisonLabel}
              icon={<RouteIcon />}
            />
            <KpiCard
              label="Fuel cost"
              value={compactMoney(data.summary.fuel_cost.value)}
              kpi={data.summary.fuel_cost}
              invertTrend
              comparisonLabel={comparisonLabel}
              description={formatLitres(data.summary.fuel_litres.value)}
              icon={<FuelIcon />}
            />
          </ReportKpiGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ReportTrendChart
                title="Completed vs delayed"
                description={periodLabel}
                kind="bar"
                stacked
                data={data.trend}
                formatValue={formatCount}
                series={[
                  {
                    key: "completed",
                    label: "Completed",
                    color: "var(--primary)",
                  },
                  {
                    key: "delayed",
                    label: "Delayed",
                    color: "var(--destructive)",
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <ReportBreakdown
                title="By status"
                description={`${formatCount(data.summary.shipments.value)} shipments`}
                items={data.by_status.map((s) => ({
                  key: s.status,
                  label: tr(`shipments.status.${s.status}`),
                  value: Number(s.count),
                  display: formatCount(s.count),
                  color: statusColors[s.status] ?? "var(--muted-foreground)",
                }))}
              />
            </div>
          </div>

          <ReportTable
            title="Lane performance"
            description="Trips, fuel cost and on-time rate per route"
            rows={data.by_lane}
            columns={laneColumns}
            rowKey={(r) => `${r.origin}-${r.destination}`}
            defaultSort="trips"
            exportName={`shipments-by-lane_${period.from}_${period.to}`}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportTable
              title="Drivers"
              rows={data.by_driver}
              columns={driverColumns}
              rowKey={(r) => String(r.driver.id)}
              defaultSort="trips"
              exportName={`shipments-by-driver_${period.from}_${period.to}`}
            />
            <ReportTable
              title="Vehicles"
              description="Distance and fuel efficiency per truck"
              rows={data.by_vehicle}
              columns={vehicleColumns}
              rowKey={(r) => String(r.vehicle.id)}
              defaultSort="distance_km"
              exportName={`shipments-by-vehicle_${period.from}_${period.to}`}
            />
          </div>
        </>
      )}
    </ReportPage>
  )
}
