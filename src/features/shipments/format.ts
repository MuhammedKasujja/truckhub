import Decimal from "decimal.js"
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

/** Billing preview: unit price × days + fuel − discount (before tax). */
export const shipmentBilling = (shp: Shipment) => {
  const days = serviceDays(shp)
  const unitPrice = toDecimal(shp.item.unit_price)
  const base = unitPrice.times(days)
  const fuel = toDecimal(shp.consumption?.total_fuel_charge)
  const discount = toDecimal(shp.item.discount)
  return {
    days,
    unitPrice,
    base,
    fuel,
    discount,
    total: base.plus(fuel).minus(discount),
  }
}

/** Status-driven workflow: which actions make sense right now. */
export const shipmentActions = (shp: Shipment) => {
  const s: ShipmentStatus = shp.status
  const isPreTrip = ["unassigned", "vehicle_assigned", "assigned"].includes(s)
  const isOnTrip = ["dispatched", "in_progress", "delayed", "idel"].includes(s)
  const isClosed = ["invoiced", "cancelled"].includes(s)

  return {
    assignVehicle: isPreTrip && !shp.vehicle,
    assignDriver: (isPreTrip || isOnTrip) && !shp.driver,
    changeVehicle: (isPreTrip || isOnTrip) && !!shp.vehicle,
    dispatch: isPreTrip && !!shp.vehicle && !!shp.driver,
    dispatchBlocked: isPreTrip && (!shp.vehicle || !shp.driver),
    finish: isOnTrip,
    capture: s === "completed" || s === "captured_details",
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
