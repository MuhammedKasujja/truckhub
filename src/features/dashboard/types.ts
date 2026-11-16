import type { Invoice } from "../invoices/types"
import type { Quotation } from "../quotations/types"
import type { Payment } from "@/features/payments/types"
import type { Shipment } from "@/features/shipments/types"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { VehicleStatus } from "@/features/vehicles/enums"
import type { MaintenanceRecord } from "@/features/maintanence/types"

/**
 * A single headline metric.
 * `previous` is the same metric for the period of equal length immediately before.
 * It is null for metrics that describe the present (outstanding balance, active
 * shipments, fleet utilisation), which have no earlier value to compare with.
 * `series` is one value per day of the period (oldest → newest) for sparklines;
 * empty for present-state metrics.
 */
export type DashboardKpi = {
  value: number
  previous?: number | null
  series?: number[]
}

export type DashboardKpis = {
  /** Invoices issued in the period */
  revenue: DashboardKpi
  /** Payments received in the period, net of refunds */
  collected: DashboardKpi
  /** Balance still owed now; `count` is the number of unpaid invoices */
  outstanding: DashboardKpi & { count: number }
  /** Trips dispatched or in progress now */
  active_shipments: DashboardKpi
  /** percentage 0–100 */
  fleet_utilization: DashboardKpi & { in_use: number; total: number }
  /** percentage 0–100 of sent quotations that were accepted */
  quote_conversion: DashboardKpi
}

export type DashboardAlerts = {
  delayed_shipments: number
  unassigned_shipments: number
  overdue_invoices: number
  /** Scheduled services starting within 7 days, including late ones */
  maintenance_due: number
}

export type DashboardRevenuePoint = {
  /** yyyy-MM-dd */
  date: string
  invoiced: number
  paid: number
}

export type DashboardStatistics = {
  statistics: {
    clients: {
      total: number
    }
    drivers: {
      total: number
    }
    invoices: {
      total: number
    }
    quotations: {
      total: number
    }
    payments: {
      total_count: number
      total_amount: number
    }
  }
  recent_quotations: Quotation[]
  recent_invoices: Invoice[]
  recent_payments: Payment[]

  // ---- Depend on the selected period, or describe operations right now ----
  kpis: DashboardKpis
  alerts: DashboardAlerts
  /** One point per day of the selected period */
  revenue_series: DashboardRevenuePoint[]
  shipments_by_status: Partial<Record<ShipmentStatus, number>>
  vehicles_by_status: Partial<Record<VehicleStatus, number>>
  upcoming_maintenance: MaintenanceRecord[]
  recent_shipments: Shipment[]
}
