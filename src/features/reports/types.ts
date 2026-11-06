/**
 * Response contracts for `GET /v1/reports/{entity}?from=yyyy-MM-dd&to=yyyy-MM-dd`.
 *
 * Every report follows the same outline so the backend can share plumbing:
 *  - `summary`   headline metrics for the period (with `previous` = equal-length period before)
 *  - `trend`     ordered time buckets (oldest → newest); the API picks the granularity
 *  - `by_*`      breakdowns / leaderboards for the period
 *
 * Money values are numbers in the company currency (strings are tolerated and coerced).
 * Percentages are 0–100.
 */
import type { EntityId } from "@/schemas"
import type { DashboardKpi } from "@/features/dashboard/types"
import type { InvoiceStatus } from "@/features/invoices/enums"
import type { QuotationStatus } from "@/features/quotations/enums"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { PaymentMode, PaymentStatus } from "@/features/payments/types"

export const reportEntities = [
  "invoices",
  "quotations",
  "payments",
  "shipments",
  "pricings",
] as const

export type ReportEntity = (typeof reportEntities)[number]

/** Same shape as a dashboard KPI so `KpiCard` can render it directly. */
export type ReportMetric = DashboardKpi

export type ReportClientRef = {
  id: EntityId
  number: string
  name: string
}

type CountAmount = { count: number; amount: number }

// ---------------------------------------------------------------- Invoices

export const invoiceAgingBuckets = [
  "current",
  "1_30",
  "31_60",
  "61_90",
  "90_plus",
] as const

export type InvoiceAgingBucket = (typeof invoiceAgingBuckets)[number]

export type InvoiceReport = {
  summary: {
    invoiced: ReportMetric
    collected: ReportMetric
    outstanding: ReportMetric & { count?: number }
    overdue: ReportMetric & { count?: number }
    invoice_count: ReportMetric
    /** average days between issue and full payment */
    average_days_to_pay?: ReportMetric
  }
  trend: { date: string; invoiced: number; collected: number }[]
  by_status: ({ status: InvoiceStatus } & CountAmount)[]
  /** unpaid balances grouped by days past due date */
  aging: ({ bucket: InvoiceAgingBucket } & CountAmount)[]
  by_client: {
    client: ReportClientRef
    invoice_count: number
    invoiced: number
    collected: number
    outstanding: number
  }[]
}

// -------------------------------------------------------------- Quotations

export type QuotationReport = {
  summary: {
    quoted_value: ReportMetric
    quotation_count: ReportMetric
    accepted_value: ReportMetric
    /** accepted + invoiced ÷ all decided (sent, accepted, rejected, invoiced, expired) */
    win_rate: ReportMetric
    average_value: ReportMetric
  }
  trend: { date: string; created: number; accepted: number }[]
  by_status: ({ status: QuotationStatus } & CountAmount)[]
  by_client: {
    client: ReportClientRef
    quotation_count: number
    quoted_value: number
    accepted_count: number
    win_rate: number
  }[]
  by_service: {
    service: { id: EntityId; name: string }
    line_items: number
    quoted_value: number
    accepted_count: number
    win_rate: number
  }[]
}

// ---------------------------------------------------------------- Payments

export type PaymentReport = {
  summary: {
    collected: ReportMetric
    payment_count: ReportMetric
    average_payment: ReportMetric
    refunded: ReportMetric
    /** received but not yet applied to an invoice */
    unapplied: ReportMetric
  }
  trend: { date: string; amount: number; count: number }[]
  by_method: ({ method: PaymentMode } & CountAmount)[]
  by_status: ({ status: PaymentStatus } & CountAmount)[]
  by_client: {
    client: ReportClientRef
    payment_count: number
    amount: number
    /** client's unpaid invoice balance at the end of the period */
    outstanding_balance: number
  }[]
}

// --------------------------------------------------------------- Shipments

export type ShipmentReport = {
  summary: {
    shipments: ReportMetric
    completed: ReportMetric
    /** completed on or before scheduled_end */
    on_time_rate: ReportMetric
    distance_km: ReportMetric
    fuel_litres: ReportMetric
    fuel_cost: ReportMetric
  }
  trend: { date: string; completed: number; delayed: number }[]
  by_status: { status: ShipmentStatus; count: number }[]
  by_lane: {
    origin: string
    destination: string
    trips: number
    distance_km: number
    fuel_cost: number
    on_time_rate: number
  }[]
  by_driver: {
    driver: { id: EntityId; number: string; fullname: string }
    trips: number
    distance_km: number
    on_time_rate: number
  }[]
  by_vehicle: {
    vehicle: { id: EntityId; number: string; plate_number: string }
    trips: number
    distance_km: number
    fuel_litres: number
    fuel_cost: number
  }[]
}

// ---------------------------------------------------------------- Pricings

export type PricingReport = {
  summary: {
    /** pricing rules (services) used on at least one quotation in the period */
    rules_used: ReportMetric & { total?: number }
    quoted_items: ReportMetric
    average_unit_price: ReportMetric
    /** average discount on quoted line items, 0–100 */
    average_discount_rate: ReportMetric
    /** invoiced revenue from line items priced by a rule */
    revenue: ReportMetric
  }
  trend: { date: string; quoted_items: number; average_unit_price: number }[]
  by_service: {
    service: { id: EntityId; name: string; category: string | null }
    base_fare: number
    min_fare: number
    quoted_items: number
    average_unit_price: number
    average_discount_rate: number
    revenue: number
  }[]
  by_vehicle_category: {
    category: { id: EntityId; name: string }
    quoted_items: number
    average_unit_price: number
    revenue: number
  }[]
}

export type ReportResponseMap = {
  invoices: InvoiceReport
  quotations: QuotationReport
  payments: PaymentReport
  shipments: ShipmentReport
  pricings: PricingReport
}
