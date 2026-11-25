import type { QueryClient } from "@tanstack/react-query"
import type { EntityId } from "@/schemas"
import type { Invoice } from "@/features/invoices/types"
import type { Quotation, QuotationVersion } from "@/features/quotations/types"
import type { Shipment } from "@/features/shipments/types"
import type { SystemUser } from "@/features/users/types"
import type { Vehicle } from "@/features/vehicles/types"
import type { Driver } from "@/features/drivers/types"
import type { Client } from "@/features/clients/types"
import type { Payment } from "@/features/payments/types"
import { getInvoicesFn } from "@/features/invoices/services"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { getQuotationsFn } from "@/features/quotations/services"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { getShipmentsFn } from "@/features/shipments/services"
import { shipmentsDetailsQueryOptions } from "@/features/shipments/query-options"
import { tripRoute } from "@/features/shipments/format"
import { getUsersFn } from "@/features/users/services"
import { userDetailsQueryOptions } from "@/features/users/query-options"
import { getVehiclesByQueryFn } from "@/features/vehicles/services"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { getDriversByQueryFn } from "@/features/drivers/services"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { getClientsByQueryFn } from "@/features/clients/services"
import { clientProfileQueryOptions } from "@/features/clients/query-options"
import { getPaymentsFn } from "@/features/payments/services"
import { paymentDetailsQueryOptions } from "@/features/payments/query-options"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"

export const MENTION_TYPES = [
  "invoice",
  "quotation",
  "payment",
  "trip",
  "client",
  "driver",
  "vehicle",
  "user",
] as const
export type MentionType = (typeof MENTION_TYPES)[number]

/** A search result: enough to show it in the list and insert it as a reference. */
export type MentionHit = {
  type: MentionType
  id: EntityId
  /** Inserted as the reference: a number for documents, a name for people, a plate for vehicles */
  display: string
  secondary?: string
}

export type MentionField<T> = {
  /** Written after the dot, e.g. `@INV-0042.total` */
  path: string
  label: string
  get: (entity: T) => string | null | undefined
}

type MentionEntity<T> = {
  type: MentionType
  label: string
  /** Typing one of these first (`@invoice 42`, `@inv 42`) searches only this type */
  aliases: string[]
  search: (q: string) => Promise<MentionHit[]>
  detail: (queryClient: QueryClient, id: EntityId) => Promise<T>
  fields: MentionField<T>[]
}

const PER_TYPE = 5
// The API rejects per_page below 10 (422), so ask for 10 and show the first PER_TYPE
const LIST = { page: 1, perPage: 10 } as const

const money = (v?: string | number | null) => (v == null || v === "" ? "" : formatMoney(v))
const date = (v?: string | Date | null) => formatDate(v)

function hits<T>(
  rows: T[] | undefined,
  type: MentionType,
  id: (row: T) => EntityId,
  display: (row: T) => string | null | undefined,
  secondary?: (row: T) => string | null | undefined
): MentionHit[] {
  return (rows ?? []).slice(0, PER_TYPE).map((row) => ({
    type,
    id: id(row),
    display: display(row) || "(no number)",
    secondary: secondary?.(row) ?? undefined,
  }))
}

const invoice: MentionEntity<Invoice> = {
  type: "invoice",
  label: "Invoice",
  aliases: ["invoice", "inv"],
  search: async (q) => {
    const res = await getInvoicesFn({ data: { ...LIST, search: q } })
    return hits(res.data, "invoice", (i) => i.id, (i) => i.number, (i) => i.client.name)
  },
  detail: async (qc, id) => (await qc.fetchQuery(invoiceDetailsQueryOptions(id))).data,
  fields: [
    { path: "number", label: "Number", get: (i) => i.number },
    { path: "total", label: "Total", get: (i) => money(i.total) },
    { path: "balance_due", label: "Balance due", get: (i) => money(i.balance_due) },
    { path: "amount_paid", label: "Amount paid", get: (i) => money(i.amount_paid) },
    { path: "due_date", label: "Due date", get: (i) => date(i.due_date) },
    { path: "created_at", label: "Issued on", get: (i) => date(i.created_at) },
    { path: "purpose", label: "Purpose", get: (i) => i.purpose },
    { path: "client.name", label: "Client name", get: (i) => i.client.name },
  ],
}

// activeRevision is only added by the details request
const quotationVersion = (q: Quotation) =>
  (q.activeRevision as QuotationVersion | undefined) ?? q.current_version

const quotation: MentionEntity<Quotation> = {
  type: "quotation",
  label: "Quotation",
  aliases: ["quotation", "quote", "qt"],
  search: async (q) => {
    const res = await getQuotationsFn({ data: { ...LIST, search: q } })
    return hits(res.data, "quotation", (x) => x.id, (x) => x.number, (x) => x.client.name)
  },
  detail: async (qc, id) => (await qc.fetchQuery(quotationDetailsQueryOptions(id))).data,
  fields: [
    { path: "number", label: "Number", get: (q) => q.number },
    { path: "total", label: "Total", get: (q) => money(quotationVersion(q).total_amount) },
    { path: "valid_until", label: "Valid until", get: (q) => date(quotationVersion(q).valid_until) },
    { path: "start_date", label: "Start date", get: (q) => date(quotationVersion(q).start_date) },
    { path: "end_date", label: "End date", get: (q) => date(quotationVersion(q).end_date) },
    { path: "purpose", label: "Purpose", get: (q) => quotationVersion(q).purpose },
    { path: "client.name", label: "Client name", get: (q) => q.client.name },
    { path: "contact.name", label: "Contact name", get: (q) => q.contact?.name },
  ],
}

const payment: MentionEntity<Payment> = {
  type: "payment",
  label: "Payment",
  aliases: ["payment", "pay", "receipt"],
  search: async (q) => {
    const res = await getPaymentsFn({ data: { ...LIST, search: q } })
    return hits(res.data, "payment", (p) => p.id, (p) => p.number, (p) => p.client.fullname)
  },
  detail: (qc, id) => qc.fetchQuery(paymentDetailsQueryOptions(id)),
  fields: [
    { path: "number", label: "Number", get: (p) => p.number },
    { path: "amount", label: "Amount", get: (p) => money(p.amount) },
    { path: "paid_at", label: "Paid on", get: (p) => date(p.paid_at) },
    { path: "method", label: "Method", get: (p) => p.method.replaceAll("_", " ") },
    { path: "transaction_ref", label: "Transaction reference", get: (p) => p.transaction_ref },
    { path: "status", label: "Status", get: (p) => p.status.replaceAll("_", " ") },
    { path: "invoice.number", label: "Invoice number", get: (p) => p.entity.number },
    { path: "invoice.balance_due", label: "Invoice balance due", get: (p) => money(p.entity.balance_due) },
    { path: "client.name", label: "Client name", get: (p) => p.client.fullname },
  ],
}

const trip: MentionEntity<Shipment> = {
  type: "trip",
  label: "Trip",
  aliases: ["trip", "shipment"],
  search: async (q) => {
    const res = await getShipmentsFn({ data: { ...LIST, search: q } })
    return hits(
      res.data,
      "trip",
      (s) => s.id,
      (s) => s.number,
      (s) => {
        const route = tripRoute(s)
        return route ? `${route.origin} → ${route.destination}` : s.driver?.full_name
      }
    )
  },
  detail: (qc, id) => qc.fetchQuery(shipmentsDetailsQueryOptions(id)),
  fields: [
    { path: "number", label: "Number", get: (s) => s.number },
    { path: "origin", label: "Pickup", get: (s) => tripRoute(s)?.origin },
    { path: "destination", label: "Drop-off", get: (s) => tripRoute(s)?.destination },
    {
      path: "route",
      label: "Full route",
      get: (s) => {
        const r = tripRoute(s)
        return r && [r.origin, ...r.checkpoints, r.destination].filter(Boolean).join(" → ")
      },
    },
    { path: "scheduled_start", label: "Scheduled start", get: (s) => formatDateTime(s.item.scheduled_start ?? "") },
    { path: "scheduled_end", label: "Scheduled end", get: (s) => formatDateTime(s.item.scheduled_end ?? "") },
    { path: "status", label: "Status", get: (s) => s.status.replaceAll("_", " ") },
    { path: "driver.name", label: "Driver name", get: (s) => s.driver?.full_name },
    { path: "driver.phone", label: "Driver phone", get: (s) => s.driver?.phone },
    { path: "vehicle.plate", label: "Vehicle plate", get: (s) => s.vehicle?.plate_number },
    { path: "contact_name", label: "Contact name", get: (s) => s.contact_name },
  ],
}

const client: MentionEntity<Client> = {
  type: "client",
  label: "Client",
  aliases: ["client", "customer"],
  search: async (q) => {
    const res = await getClientsByQueryFn({ data: { ...LIST, search: q } })
    return hits(res.data, "client", (c) => c.id, (c) => c.name, (c) => c.number)
  },
  detail: async (qc, id) => (await qc.fetchQuery(clientProfileQueryOptions(id))).data as Client,
  fields: [
    { path: "name", label: "Name", get: (c) => c.name },
    { path: "number", label: "Number", get: (c) => c.number },
    { path: "email", label: "Email", get: (c) => c.email },
    { path: "phone", label: "Phone", get: (c) => c.phone },
    { path: "balance", label: "Balance", get: (c) => money(c.balance) },
  ],
}

const driver: MentionEntity<Driver> = {
  type: "driver",
  label: "Driver",
  aliases: ["driver"],
  search: async (q) => {
    const rows = await getDriversByQueryFn({ data: { ...LIST, search: q } })
    return hits(rows, "driver", (d) => d.id, (d) => d.full_name, (d) => d.phone)
  },
  detail: async (qc, id) => (await qc.fetchQuery(driverProfileQueryOptions(id))).data as Driver,
  fields: [
    { path: "name", label: "Name", get: (d) => d.full_name },
    { path: "phone", label: "Phone", get: (d) => d.phone },
    { path: "email", label: "Email", get: (d) => d.email },
    { path: "number", label: "Number", get: (d) => d.number },
  ],
}

const vehicle: MentionEntity<Vehicle> = {
  type: "vehicle",
  label: "Vehicle",
  aliases: ["vehicle", "truck", "car"],
  search: async (q) => {
    const res = await getVehiclesByQueryFn({ data: { ...LIST, search: q } })
    return hits(
      res.data,
      "vehicle",
      (v) => v.id,
      (v) => v.plate_number,
      (v) => `${v.car_model.car_brand.name} ${v.car_model.name}`.trim()
    )
  },
  detail: async (qc, id) => (await qc.fetchQuery(vehicleDetailsQueryOptions(id))).data,
  fields: [
    { path: "plate", label: "Plate number", get: (v) => v.plate_number },
    {
      path: "model",
      label: "Make and model",
      get: (v) => `${v.car_model.car_brand.name} ${v.car_model.name}`.trim(),
    },
    { path: "year", label: "Year", get: (v) => v.year },
    { path: "category", label: "Category", get: (v) => v.category.name },
    { path: "driver.name", label: "Assigned driver", get: (v) => v.driver?.full_name },
  ],
}

const user: MentionEntity<SystemUser> = {
  type: "user",
  label: "User",
  aliases: ["user", "staff"],
  search: async (q) => {
    const res = await getUsersFn({ data: { ...LIST, search: q } })
    return hits(res.data, "user", (u) => u.id, (u) => u.name, (u) => u.email)
  },
  detail: async (qc, id) => (await qc.fetchQuery(userDetailsQueryOptions(id))).data as SystemUser,
  fields: [
    { path: "name", label: "Name", get: (u) => u.name },
    { path: "email", label: "Email", get: (u) => u.email },
    { path: "phone", label: "Phone", get: (u) => u.phone },
  ],
}

 
export const MENTION_REGISTRY: Record<MentionType, MentionEntity<any>> = {
  invoice,
  quotation,
  payment,
  trip,
  client,
  driver,
  vehicle,
  user,
}

/** Splits `invoice 42` into a type and a search; a bare query searches every type. */
export function parseMentionQuery(query: string): {
  type: MentionType | null
  search: string
} {
  const trimmed = query.trimStart()
  const match = /^(\w+)(?:\s+|:)(.*)$/s.exec(trimmed)
  if (match) {
    const alias = match[1].toLowerCase()
    const type = MENTION_TYPES.find((t) => MENTION_REGISTRY[t].aliases.includes(alias))
    if (type) return { type, search: match[2].trim() }
  }
  return { type: null, search: trimmed.trim() }
}

export async function searchMentions(query: string): Promise<MentionHit[]> {
  const { type, search } = parseMentionQuery(query)
  const types = type ? [type] : MENTION_TYPES
  const results = await Promise.allSettled(types.map((t) => MENTION_REGISTRY[t].search(search)))
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
}

/** The value of one field of a record, formatted for the email. */
export async function resolveMentionField(
  queryClient: QueryClient,
  type: MentionType,
  id: EntityId,
  path: string
): Promise<string> {
  const entity = MENTION_REGISTRY[type]
  const field = entity.fields.find((f) => f.path === path)
  if (!field) return ""
  const record = await entity.detail(queryClient, id)
  return field.get(record) ?? ""
}
