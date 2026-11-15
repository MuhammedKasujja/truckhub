import Decimal from "decimal.js"
import { ON_TRIP_STATUSES } from "./enums"
import type { ShipmentStatus } from "./enums"
import type { Shipment } from "./types"

export type TripRoute = {
  origin: string
  checkpoints: string[]
  destination: string
}

/** Route stops for a shipment, or null when the line item has none. */
export const tripRoute = (shp: Shipment): TripRoute | null => {
  const route = (shp.item as { route?: Partial<TripRoute> | null }).route
  if (!route?.origin && !route?.destination) return null
  return {
    origin: route.origin ?? "",
    checkpoints: route.checkpoints ?? [],
    destination: route.destination ?? "",
  }
}

export const toDecimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

export const serviceDays = (shp: Shipment) => shp.consumption?.days || 1

/**
 * Billing preview, priced the way the invoice prices a trip (before tax):
 * unit price × days, doubled for a round trip, less this trip's share of the
 * line discount, plus fuel.
 */
export const shipmentBilling = (shp: Shipment) => {
  const days = serviceDays(shp)
  const unitPrice = toDecimal(shp.item.unit_price)
  const isRoundTrip = !!shp.item.is_round_trip
  const base = unitPrice.times(isRoundTrip ? 2 : 1).times(days)
  const fuel = toDecimal(shp.consumption?.total_fuel_charge)
  // A trip is never discounted below zero
  const discount = Decimal.min(toDecimal(shp.discount_share), base)
  const hire = base.minus(discount)
  return {
    days,
    unitPrice,
    isRoundTrip,
    base,
    fuel,
    discount,
    /** The taxable part: what the invoice line totals to. */
    hire,
    total: hire.plus(fuel),
  }
}

/** Status-driven workflow: which actions make sense right now. */
export const shipmentActions = (shp: Shipment) => {
  const s: ShipmentStatus = shp.status
  const isPreTrip = ["unassigned", "vehicle_assigned", "assigned"].includes(s)
  const isOnTrip = ON_TRIP_STATUSES.includes(s)
  const isClosed = ["invoiced", "cancelled"].includes(s)

  return {
    assignVehicle: isPreTrip && !shp.vehicle,
    // A driver can be set, or swapped, until the trip ends
    assignDriver: isPreTrip || isOnTrip,
    changeVehicle: (isPreTrip || isOnTrip) && !!shp.vehicle,
    dispatch: isPreTrip && !!shp.vehicle && !!shp.driver,
    dispatchBlocked: isPreTrip && (!shp.vehicle || !shp.driver),
    finish: isOnTrip,
    // Capturing details also ends a trip still on the road. Details are
    // captured once: the API refuses a second capture.
    capture: isOnTrip || s === "completed",
    isClosed,
  }
}

export const elapsedLabel = (from?: Date | string, to?: Date | string) => {
  if (!from) return null
  const end = to ? new Date(to).getTime() : Date.now()
  const minutes = Math.max(
    0,
    Math.floor((end - new Date(from).getTime()) / 60_000)
  )
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

const CONFLICT_LABEL: Record<string, string> = {
  booked: "booked for another trip",
  maintenance: "in maintenance",
  blocked: "blocked",
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/**
 * The windows that stop a vehicle being assigned, as one sentence. `conflicts`
 * is the `details.conflicts` of the API's "vehicle unavailable" error; anything
 * else gives null.
 */
export const vehicleConflictMessage = (conflicts: unknown): string | null => {
  if (!Array.isArray(conflicts) || conflicts.length === 0) return null

  const windows = conflicts
    .filter(
      (c): c is { status: string; start: string; end: string | null } =>
        !!c && typeof c.status === "string" && typeof c.start === "string"
    )
    .map((c) => {
      const what = CONFLICT_LABEL[c.status] ?? c.status
      return c.end
        ? `${what} ${shortDate(c.start)} – ${shortDate(c.end)}`
        : `${what} from ${shortDate(c.start)}`
    })

  if (windows.length === 0) return null
  return `This vehicle is not available for the trip's dates: ${windows.join("; ")}.`
}
