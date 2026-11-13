import type { ResolvedReportPeriod } from "./schemas"
/**
 * DEV-ONLY sample data for previewing report layouts before the backend ships
 * `GET /v1/reports/{entity}`.
 *
 * Active by default in `pnpm dev`; add `?preview=false` to see real data only.
 * Real API values always win; preview data only fills top-level fields that are missing.
 */
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"
import type {
  ReportEntity,
  ReportMetric,
  InvoiceReport,
  PaymentReport,
  PricingReport,
  ShipmentReport,
  QuotationReport,
  ReportClientRef,
  ReportResponseMap,
} from "./types"

export const isReportPreviewEnabled = (flag: boolean | undefined) =>
  import.meta.env.DEV && flag === true

/** Small deterministic PRNG so the preview doesn't jump around on refetch. */
function seeded(seed: number) {
  let s = Math.abs(seed) % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function seedFrom(entity: string, period: ResolvedReportPeriod) {
  return [...`${entity}${period.from}${period.to}`].reduce(
    (acc, c) => (acc * 31 + c.charCodeAt(0)) % 2147483647,
    7
  )
}

type Rand = () => number

const between = (rand: Rand, min: number, max: number) =>
  Math.round(min + rand() * (max - min))

/** Daily buckets up to ~2 months, weekly beyond that. */
function buckets(period: ResolvedReportPeriod) {
  const start = parseISO(period.from)
  const days = differenceInCalendarDays(parseISO(period.to), start) + 1
  const step = days > 62 ? 7 : 1
  return Array.from({ length: Math.ceil(days / step) }, (_, i) =>
    format(addDays(start, i * step), "yyyy-MM-dd")
  )
}

function metric(
  rand: Rand,
  value: number,
  changePct = between(rand, -18, 24),
  points = 12
): ReportMetric {
  const previous = Math.round(value / (1 + changePct / 100))
  const series = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    return Math.round(
      (previous + (value - previous) * t) * (0.9 + rand() * 0.2)
    )
  })
  series[series.length - 1] = value
  return { value, previous, series }
}

const clients: ReportClientRef[] = [
  { id: "preview-client-1", number: "CL-0012", name: "Kampala Cement Ltd" },
  { id: "preview-client-2", number: "CL-0034", name: "Nile Breweries" },
  { id: "preview-client-3", number: "CL-0041", name: "Mukwano Industries" },
  { id: "preview-client-4", number: "CL-0057", name: "Roofings Group" },
  { id: "preview-client-5", number: "CL-0063", name: "Hima Logistics" },
  { id: "preview-client-6", number: "CL-0078", name: "Lake Victoria Farms" },
  { id: "preview-client-7", number: "CL-0090", name: "Mbarara Dairy Co-op" },
]

const services = [
  { id: "preview-service-1", name: "Flatbed 30T", category: "Heavy haulage" },
  { id: "preview-service-2", name: "Tipper 20T", category: "Construction" },
  { id: "preview-service-3", name: "Box truck 10T", category: "General cargo" },
  { id: "preview-service-4", name: "Reefer 15T", category: "Cold chain" },
  { id: "preview-service-5", name: "Tanker 25,000L", category: "Liquids" },
  { id: "preview-service-6", name: "Pickup 1T", category: "Light delivery" },
]

const categories = [
  { id: "preview-cat-1", name: "Heavy trucks" },
  { id: "preview-cat-2", name: "Medium trucks" },
  { id: "preview-cat-3", name: "Light vehicles" },
  { id: "preview-cat-4", name: "Specialised" },
]

const drivers = [
  "Kasujja James",
  "Nakato Grace",
  "Mugisha Brian",
  "Achieng Ruth",
  "Ssempala Paul",
  "Kato Ivan",
]

const plates = ["UBA 123X", "UBB 552K", "UAX 901M", "UBD 044P", "UBF 718R"]

const lanes = [
  ["Kampala", "Mombasa"],
  ["Kampala", "Gulu"],
  ["Jinja", "Kampala"],
  ["Mbarara", "Kigali"],
  ["Kampala", "Juba"],
  ["Tororo", "Nairobi"],
]

const sortBy = <T>(rows: T[], key: (r: T) => number) =>
  [...rows].sort((a, b) => key(b) - key(a))

function invoices(rand: Rand, period: ResolvedReportPeriod): InvoiceReport {
  const trend = buckets(period).map((date) => {
    const invoiced = between(rand, 2, 14) * 1_000_000
    return {
      date,
      invoiced,
      collected: Math.round(invoiced * (0.5 + rand() * 0.45)),
    }
  })
  const invoiced = trend.reduce((s, p) => s + p.invoiced, 0)
  const collected = trend.reduce((s, p) => s + p.collected, 0)
  const outstanding = invoiced - collected
  const count = trend.length * between(rand, 2, 4)
  const overdue = Math.round(outstanding * 0.35)

  return {
    summary: {
      invoiced: metric(rand, invoiced),
      collected: metric(rand, collected),
      outstanding: {
        ...metric(rand, outstanding),
        count: Math.round(count * 0.4),
      },
      overdue: { ...metric(rand, overdue), count: Math.round(count * 0.12) },
      invoice_count: metric(rand, count),
      average_days_to_pay: metric(rand, between(rand, 12, 34)),
    },
    trend,
    by_status: (
      [
        "paid",
        "partially_paid",
        "issued",
        "over_due",
        "draft",
        "cancelled",
      ] as const
    ).map((status, i) => ({
      status,
      count: Math.max(
        1,
        Math.round(count * [0.45, 0.15, 0.18, 0.12, 0.07, 0.03][i])
      ),
      amount: Math.round(invoiced * [0.48, 0.16, 0.17, 0.12, 0.05, 0.02][i]),
    })),
    aging: (["current", "1_30", "31_60", "61_90", "90_plus"] as const).map(
      (bucket, i) => ({
        bucket,
        count: Math.max(
          0,
          Math.round(count * 0.4 * [0.45, 0.25, 0.15, 0.1, 0.05][i])
        ),
        amount: Math.round(outstanding * [0.45, 0.25, 0.15, 0.1, 0.05][i]),
      })
    ),
    by_client: sortBy(
      clients.map((client) => {
        const inv = between(rand, 4, 40) * 1_000_000
        const col = Math.round(inv * (0.4 + rand() * 0.6))
        return {
          client,
          invoice_count: between(rand, 2, 18),
          invoiced: inv,
          collected: col,
          outstanding: inv - col,
        }
      }),
      (r) => r.invoiced
    ),
  }
}

function quotations(rand: Rand, period: ResolvedReportPeriod): QuotationReport {
  const trend = buckets(period).map((date) => {
    const created = between(rand, 1, 9)
    return { date, created, accepted: between(rand, 0, created) }
  })
  const count = trend.reduce((s, p) => s + p.created, 0)
  const accepted = trend.reduce((s, p) => s + p.accepted, 0)
  const average = between(rand, 3, 9) * 1_000_000
  const winRate = count ? (accepted / count) * 100 : 0

  return {
    summary: {
      quoted_value: metric(rand, count * average),
      quotation_count: metric(rand, count),
      accepted_value: metric(rand, accepted * average),
      win_rate: metric(rand, Math.round(winRate), between(rand, -8, 10)),
      average_value: metric(rand, average),
    },
    trend,
    by_status: (
      ["accepted", "invoiced", "sent", "rejected", "expired", "draft"] as const
    ).map((status, i) => {
      const n = Math.max(
        1,
        Math.round(count * [0.22, 0.2, 0.25, 0.12, 0.08, 0.13][i])
      )
      return { status, count: n, amount: n * average }
    }),
    by_client: sortBy(
      clients.map((client) => {
        const n = between(rand, 2, 16)
        const won = between(rand, 0, n)
        return {
          client,
          quotation_count: n,
          quoted_value: n * between(rand, 2, 9) * 1_000_000,
          accepted_count: won,
          win_rate: (won / n) * 100,
        }
      }),
      (r) => r.quoted_value
    ),
    by_service: sortBy(
      services.map((s) => {
        const items = between(rand, 3, 40)
        const won = between(rand, 0, items)
        return {
          service: { id: s.id, name: s.name },
          line_items: items,
          quoted_value: items * between(rand, 1, 6) * 1_000_000,
          accepted_count: won,
          win_rate: (won / items) * 100,
        }
      }),
      (r) => r.quoted_value
    ),
  }
}

function payments(rand: Rand, period: ResolvedReportPeriod): PaymentReport {
  const trend = buckets(period).map((date) => {
    const n = between(rand, 0, 8)
    return { date, count: n, amount: n * between(rand, 1, 4) * 1_000_000 }
  })
  const amount = trend.reduce((s, p) => s + p.amount, 0)
  const count = trend.reduce((s, p) => s + p.count, 0)

  return {
    summary: {
      collected: metric(rand, amount),
      payment_count: metric(rand, count),
      average_payment: metric(rand, count ? Math.round(amount / count) : 0),
      refunded: metric(rand, Math.round(amount * 0.02)),
      unapplied: metric(rand, Math.round(amount * 0.05)),
    },
    trend,
    by_method: (
      ["bank_transfer", "mobile_money", "cash", "credit_card"] as const
    ).map((method, i) => ({
      method,
      count: Math.round(count * [0.42, 0.35, 0.15, 0.08][i]),
      amount: Math.round(amount * [0.55, 0.28, 0.1, 0.07][i]),
    })),
    by_status: (
      [
        "completed",
        "pending",
        "partially_refunded",
        "reversed",
        "failed",
      ] as const
    ).map((status, i) => ({
      status,
      count: Math.round(count * [0.82, 0.08, 0.04, 0.03, 0.03][i]),
      amount: Math.round(amount * [0.86, 0.07, 0.03, 0.02, 0.02][i]),
    })),
    by_client: sortBy(
      clients.map((client) => ({
        client,
        payment_count: between(rand, 1, 12),
        amount: between(rand, 2, 30) * 1_000_000,
        outstanding_balance: between(rand, 0, 12) * 1_000_000,
      })),
      (r) => r.amount
    ),
  }
}

function shipments(rand: Rand, period: ResolvedReportPeriod): ShipmentReport {
  const trend = buckets(period).map((date) => ({
    date,
    completed: between(rand, 1, 10),
    delayed: between(rand, 0, 2),
  }))
  const completed = trend.reduce((s, p) => s + p.completed, 0)
  const delayed = trend.reduce((s, p) => s + p.delayed, 0)
  const total = completed + delayed + between(rand, 4, 14)
  const distance = completed * between(rand, 180, 420)
  const litres = Math.round(distance / 3.2)

  return {
    summary: {
      shipments: metric(rand, total),
      completed: metric(rand, completed),
      on_time_rate: metric(rand, between(rand, 78, 96), between(rand, -5, 6)),
      distance_km: metric(rand, distance),
      fuel_litres: metric(rand, litres),
      fuel_cost: metric(rand, litres * 5200),
    },
    trend,
    by_status: (
      [
        "completed",
        "invoiced",
        "in_progress",
        "dispatched",
        "assigned",
        "unassigned",
        "delayed",
        "cancelled",
      ] as const
    ).map((status, i) => ({
      status,
      count: Math.max(
        0,
        Math.round(total * [0.38, 0.22, 0.1, 0.06, 0.07, 0.07, 0.06, 0.04][i])
      ),
    })),
    by_lane: sortBy(
      lanes.map(([origin, destination]) => {
        const trips = between(rand, 2, 24)
        const km = trips * between(rand, 120, 1100)
        return {
          origin,
          destination,
          trips,
          distance_km: km,
          fuel_cost: Math.round((km / 3.2) * 5200),
          on_time_rate: between(rand, 65, 100),
        }
      }),
      (r) => r.trips
    ),
    by_driver: sortBy(
      drivers.map((fullname, i) => {
        const trips = between(rand, 3, 20)
        return {
          driver: {
            id: `preview-driver-${i}`,
            number: `DRV-${100 + i}`,
            fullname,
          },
          trips,
          distance_km: trips * between(rand, 150, 500),
          on_time_rate: between(rand, 70, 100),
        }
      }),
      (r) => r.trips
    ),
    by_vehicle: sortBy(
      plates.map((plate_number, i) => {
        const trips = between(rand, 3, 22)
        const km = trips * between(rand, 150, 500)
        const l = Math.round(km / (2.6 + rand() * 1.4))
        return {
          vehicle: {
            id: `preview-vehicle-${i}`,
            number: `VH-${200 + i}`,
            plate_number,
          },
          trips,
          distance_km: km,
          fuel_litres: l,
          fuel_cost: l * 5200,
        }
      }),
      (r) => r.distance_km
    ),
  }
}

function pricings(rand: Rand, period: ResolvedReportPeriod): PricingReport {
  const trend = buckets(period).map((date) => ({
    date,
    quoted_items: between(rand, 1, 14),
    average_unit_price: between(rand, 900, 2400) * 1000,
  }))
  const items = trend.reduce((s, p) => s + p.quoted_items, 0)
  const avgPrice = Math.round(
    trend.reduce((s, p) => s + p.average_unit_price, 0) /
      Math.max(1, trend.length)
  )
  const byService = sortBy(
    services.map((s) => {
      const base = between(rand, 400, 2500) * 1000
      const quoted = between(rand, 2, 40)
      const avg = Math.round(base * (0.85 + rand() * 0.4))
      return {
        service: s,
        base_fare: base,
        min_fare: Math.round(base * 0.6),
        quoted_items: quoted,
        average_unit_price: avg,
        average_discount_rate: between(rand, 0, 14),
        revenue: Math.round(quoted * avg * (0.4 + rand() * 0.5)),
      }
    }),
    (r) => r.revenue
  )

  return {
    summary: {
      rules_used: {
        ...metric(rand, byService.length),
        total: byService.length + 4,
      },
      quoted_items: metric(rand, items),
      average_unit_price: metric(rand, avgPrice),
      average_discount_rate: metric(
        rand,
        between(rand, 3, 11),
        between(rand, -20, 20)
      ),
      revenue: metric(
        rand,
        byService.reduce((s, r) => s + r.revenue, 0)
      ),
    },
    trend,
    by_service: byService,
    by_vehicle_category: sortBy(
      categories.map((category) => {
        const quoted = between(rand, 3, 50)
        const avg = between(rand, 500, 2400) * 1000
        return {
          category,
          quoted_items: quoted,
          average_unit_price: avg,
          revenue: Math.round(quoted * avg * 0.6),
        }
      }),
      (r) => r.revenue
    ),
  }
}

const generators: {
  [TEntity in ReportEntity]: (
    rand: Rand,
    period: ResolvedReportPeriod
  ) => ReportResponseMap[TEntity]
} = { invoices, quotations, payments, shipments, pricings }

/** Fills top-level report fields the API didn't return with sample data. */
export function withReportPreview<TEntity extends ReportEntity>(
  entity: TEntity,
  data: Partial<ReportResponseMap[TEntity]> | null | undefined,
  period: ResolvedReportPeriod
): ReportResponseMap[TEntity] {
  const sample = generators[entity](seeded(seedFrom(entity, period)), period)
  const real = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, v]) => v !== undefined && v !== null)
  )
  return { ...sample, ...real }
}
