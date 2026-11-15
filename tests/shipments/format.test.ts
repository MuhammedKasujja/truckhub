import { describe, expect, it } from "vitest"
import {
  shipmentActions,
  shipmentBilling,
  vehicleConflictMessage,
} from "../../src/features/shipments/format"
import type { ShipmentStatus } from "../../src/features/shipments/enums"
import type { Shipment } from "../../src/features/shipments/types"

type Overrides = {
  status?: ShipmentStatus
  unitPrice?: string
  days?: number | null
  fuel?: string | null
  roundTrip?: boolean | null
  discountShare?: string
  vehicle?: boolean
  driver?: boolean
}

const shipment = ({
  status = "captured_details",
  unitPrice = "100000",
  days = 2,
  fuel = "50000",
  roundTrip = false,
  discountShare = "0",
  vehicle = true,
  driver = true,
}: Overrides = {}) =>
  ({
    id: "trip-1",
    status,
    vehicle: vehicle ? { id: "vehicle-1" } : undefined,
    driver: driver ? { id: "driver-1" } : undefined,
    discount_share: discountShare,
    item: { unit_price: unitPrice, is_round_trip: roundTrip, discount: "100" },
    consumption: { days, total_fuel_charge: fuel },
  }) as unknown as Shipment

const money = (value: { toString: () => string }) => value.toString()

describe("shipmentBilling", () => {
  it("bills the unit price for each day plus fuel", () => {
    const billing = shipmentBilling(shipment())

    expect(money(billing.base)).toBe("200000")
    expect(money(billing.hire)).toBe("200000")
    expect(money(billing.total)).toBe("250000")
  })

  it("doubles a round trip, as the invoice does", () => {
    const billing = shipmentBilling(shipment({ roundTrip: true }))

    expect(billing.isRoundTrip).toBe(true)
    expect(money(billing.base)).toBe("400000")
    expect(money(billing.total)).toBe("450000")
  })

  it("takes off the trip's share of the discount, not the whole line's", () => {
    const billing = shipmentBilling(shipment({ discountShare: "33.33" }))

    expect(money(billing.discount)).toBe("33.33")
    expect(money(billing.hire)).toBe("199966.67")
    expect(money(billing.total)).toBe("249966.67")
  })

  it("never discounts a trip below zero", () => {
    const billing = shipmentBilling(
      shipment({ unitPrice: "10", days: 1, fuel: null, discountShare: "25" })
    )

    expect(money(billing.discount)).toBe("10")
    expect(money(billing.total)).toBe("0")
  })

  it("counts a trip without recorded days as one day", () => {
    expect(shipmentBilling(shipment({ days: null })).days).toBe(1)
  })
})

describe("shipmentActions", () => {
  it("captures details for a trip on the road or just ended", () => {
    expect(shipmentActions(shipment({ status: "dispatched" })).capture).toBe(
      true
    )
    expect(shipmentActions(shipment({ status: "completed" })).capture).toBe(
      true
    )
  })

  it("does not capture details twice", () => {
    expect(
      shipmentActions(shipment({ status: "captured_details" })).capture
    ).toBe(false)
    expect(shipmentActions(shipment({ status: "invoiced" })).capture).toBe(
      false
    )
  })

  it("lets the driver be changed until the trip ends", () => {
    expect(
      shipmentActions(shipment({ status: "dispatched" })).assignDriver
    ).toBe(true)
    expect(shipmentActions(shipment({ status: "idle" })).assignDriver).toBe(
      true
    )
    expect(
      shipmentActions(shipment({ status: "completed" })).assignDriver
    ).toBe(false)
    expect(
      shipmentActions(shipment({ status: "cancelled" })).assignDriver
    ).toBe(false)
  })

  it("dispatches only a trip with a vehicle and a driver", () => {
    expect(shipmentActions(shipment({ status: "assigned" })).dispatch).toBe(
      true
    )
    const noDriver = shipmentActions(
      shipment({ status: "vehicle_assigned", driver: false })
    )
    expect(noDriver.dispatch).toBe(false)
    expect(noDriver.dispatchBlocked).toBe(true)
  })

  it("treats an idle trip as on the road", () => {
    expect(shipmentActions(shipment({ status: "idle" })).finish).toBe(true)
  })
})

describe("vehicleConflictMessage", () => {
  it("names what the vehicle is busy with", () => {
    const message = vehicleConflictMessage([
      {
        status: "booked",
        start: "2026-11-10T00:00:00+00:00",
        end: "2026-11-12T23:59:59+00:00",
      },
      { status: "maintenance", start: "2026-11-14T00:00:00+00:00", end: null },
    ])

    expect(message).toContain("booked for another trip")
    expect(message).toContain("in maintenance from")
    expect(message).toContain("2026")
  })

  it("is null when the error carries no windows", () => {
    expect(vehicleConflictMessage(undefined)).toBeNull()
    expect(vehicleConflictMessage([])).toBeNull()
    expect(vehicleConflictMessage([{ nope: true }])).toBeNull()
  })
})
