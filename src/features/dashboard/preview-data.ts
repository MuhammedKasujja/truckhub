/**
 * DEV-ONLY sample data for previewing the dashboard layout before the
 * backend ships the period-aware statistics fields.
 *
 * Enable with `/dashboard?preview=true` while running `pnpm dev`.
 * Real API values always win; preview data only fills fields that are missing.
 */
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"
import type { ResolvedDashboardPeriod } from "./schemas"
import type { DashboardKpi, DashboardStatistics } from "./types"
import type { Shipment } from "@/features/shipments/types"
import type { MaintenanceRecord } from "@/features/maintanence/types"

export const isDashboardPreviewEnabled = (flag: boolean | undefined) =>
  import.meta.env.DEV && flag === true

/** Small deterministic PRNG so the preview doesn't jump around on refetch. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function seedFrom(period: ResolvedDashboardPeriod) {
  return [...`${period.from}${period.to}`].reduce(
    (acc, c) => acc * 31 + c.charCodeAt(0),
    7
  )
}

function kpi(
  rand: () => number,
  value: number,
  changePct: number,
  points = 14
): DashboardKpi {
  const previous = Math.round(value / (1 + changePct / 100))
  const series = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    const base = previous + (value - previous) * t
    return Math.round(base * (0.9 + rand() * 0.2))
  })
  series[series.length - 1] = value
  return { value, previous, series }
}

const plates = [
  "UBA 123X",
  "UBB 552K",
  "UAX 901M",
  "UBD 044P",
  "UBF 718R",
  "UAZ 330T",
]
const drivers = [
  "Okello James",
  "Nakato Grace",
  "Mugisha Brian",
  "Achieng Ruth",
  "Ssempala Paul",
  "Kato Ivan",
]

function previewShipments(now: Date): Shipment[] {
  const statuses = [
    "in_progress",
    "delayed",
    "dispatched",
    "in_progress",
    "assigned",
    "completed",
  ] as const
  return statuses.map((status, i) => ({
    id: `preview-shipment-${i + 1}`,
    number: `SHP-${String(1042 - i).padStart(5, "0")}`,
    status,
    quotation_id: `preview-quotation-${i + 1}`,
    driver: {
      id: `preview-driver-${i + 1}`,
      number: `DRV-${100 + i}`,
      fullname: drivers[i],
      phone: "+256700000000",
      email: "driver@example.com",
    },
    vehicle: {
      id: `preview-vehicle-${i + 1}`,
      number: `VH-${200 + i}`,
      plate_number: plates[i],
      vehicle_year: "2021",
      fuel_consumption_rate: "3.2",
    },
    item: {
      scheduled_start: addDays(now, -i).toISOString(),
    },
    consumption: null,
    updated_at: now.toISOString(),
    history: null,
  })) as unknown as Shipment[]
}

function previewMaintenance(now: Date): MaintenanceRecord[] {
  const rows = [
    {
      type: "routine",
      reason: "Oil and filter change",
      days: -1,
      overdue: true,
    },
    {
      type: "inspection",
      reason: "Annual roadworthiness",
      days: 2,
      overdue: false,
    },
    {
      type: "repair",
      reason: "Brake pads replacement",
      days: 4,
      overdue: false,
    },
    { type: "routine", reason: "Tyre rotation", days: 6, overdue: false },
  ] as const
  return rows.map((row, i) => ({
    id: `preview-maintenance-${i + 1}`,
    type: row.type,
    status: "scheduled",
    reason: row.reason,
    scheduled_start: addDays(now, row.days),
    scheduled_end: null,
    expected_end: null,
    actual_start: null,
    actual_end: null,
    vehicle: {
      id: `preview-vehicle-${i + 1}`,
      plate_number: plates[i + 2],
      number: `VH-${210 + i}`,
    },
    is_overdue: row.overdue,
    allowed_transitions: [],
  })) as unknown as MaintenanceRecord[]
}

/** Builds the period-aware fields with plausible numbers scaled to the period length. */
export function buildDashboardPreview(
  period: ResolvedDashboardPeriod,
  now: Date = new Date()
): Required<
  Pick<
    DashboardStatistics,
    | "kpis"
    | "alerts"
    | "revenue_series"
    | "shipments_by_status"
    | "vehicles_by_status"
    | "upcoming_maintenance"
    | "recent_shipments"
  >
> {
  const rand = seeded(seedFrom(period))
  const start = parseISO(period.from)
  const days = differenceInCalendarDays(parseISO(period.to), start) + 1

  const revenue_series = Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i)
    const weekend = [0, 6].includes(date.getDay())
    const invoiced = Math.round(
      (weekend ? 0.6 : 1) * (1_200_000 + rand() * 1_400_000)
    )
    const paid = Math.round(invoiced * (0.55 + rand() * 0.4))
    return { date: format(date, "yyyy-MM-dd"), invoiced, paid }
  })

  const totalInvoiced = revenue_series.reduce((s, p) => s + p.invoiced, 0)
  const totalPaid = revenue_series.reduce((s, p) => s + p.paid, 0)
  const outstanding = totalInvoiced - totalPaid

  return {
    kpis: {
      revenue: kpi(rand, totalInvoiced, 12.4),
      collected: kpi(rand, totalPaid, 8.1),
      outstanding: { ...kpi(rand, outstanding, -6.3), count: 9 },
      active_shipments: kpi(rand, 27, 17.4),
      fleet_utilization: { ...kpi(rand, 78, 4.2), in_use: 31, total: 40 },
      quote_conversion: kpi(rand, 42, -3.1),
    },
    alerts: {
      delayed_shipments: 3,
      unassigned_shipments: 5,
      overdue_invoices: 2,
      maintenance_due: 1,
    },
    revenue_series,
    shipments_by_status: {
      unassigned: 5,
      assigned: 4,
      vehicle_assigned: 4,
      dispatched: 6,
      in_progress: 13,
      delayed: 3,
    },
    vehicles_by_status: {
      on_trip: 18,
      available: 13,
      in_maintenance: 4,
      reserved: 3,
      rented: 2,
    },
    upcoming_maintenance: previewMaintenance(now),
    recent_shipments: previewShipments(now),
  }
}

const emptyStatistics: DashboardStatistics = {
  statistics: {
    clients: { total: 128 },
    drivers: { total: 46 },
    invoices: { total: 312 },
    quotations: { total: 540 },
    payments: { total_count: 287, total_amount: 184_500_000 },
  },
  recent_quotations: [],
  recent_invoices: [],
  recent_payments: [],
}

/** Real data first; preview fills only what the API didn't send. */
export function withDashboardPreview(
  data: DashboardStatistics | undefined,
  period: ResolvedDashboardPeriod
): DashboardStatistics {
  const preview = buildDashboardPreview(period)
  const base = data ?? emptyStatistics
  return {
    ...base,
    kpis: base.kpis ?? preview.kpis,
    alerts: base.alerts ?? preview.alerts,
    revenue_series: base.revenue_series ?? preview.revenue_series,
    shipments_by_status:
      base.shipments_by_status ?? preview.shipments_by_status,
    vehicles_by_status: base.vehicles_by_status ?? preview.vehicles_by_status,
    upcoming_maintenance:
      base.upcoming_maintenance ?? preview.upcoming_maintenance,
    recent_shipments: base.recent_shipments ?? preview.recent_shipments,
  }
}
