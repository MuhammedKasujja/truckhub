import type { Invoice } from "../invoices/types"
import type { Quotation } from "../quotations/types"
import type { Payment } from "@/features/payments/types"
import type { Shipment } from "@/features/shipments/types"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { VehicleStatus } from "@/features/vehicles/enums"
import type { MaintenanceRecord } from "@/features/maintanence/types"

/**
 * A single headline metric for the selected period.
 * `previous` is the same metric for the period of equal length immediately before.
 * `series` is an ordered list of values (oldest → newest) used for sparklines.
 */
export type DashboardKpi = {
  value: number
  previous?: number | null
  series?: number[]
}

export type DashboardKpis = {
  revenue?: DashboardKpi
  collected?: DashboardKpi
  outstanding?: DashboardKpi & { count?: number }
  active_shipments?: DashboardKpi
  /** percentage 0–100 */
  fleet_utilization?: DashboardKpi & { in_use?: number; total?: number }
  /** percentage 0–100 */
  quote_conversion?: DashboardKpi
}

export type DashboardAlerts = {
  delayed_shipments?: number
  unassigned_shipments?: number
  overdue_invoices?: number
  maintenance_due?: number
}

export type DashboardRevenuePoint = {
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

  // ---- Period-aware fields (optional until the backend ships them) ----
  kpis?: DashboardKpis
  alerts?: DashboardAlerts
  revenue_series?: DashboardRevenuePoint[]
  shipments_by_status?: Partial<Record<ShipmentStatus, number>>
  vehicles_by_status?: Partial<Record<VehicleStatus, number>>
  upcoming_maintenance?: MaintenanceRecord[]
  recent_shipments?: Shipment[]
}
