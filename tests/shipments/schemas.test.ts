import { describe, expect, it } from "vitest"
import {
  endShipmentSchema,
  recordShipmentDetailsSchema,
} from "../../src/features/shipments/schemas"

const UNIT_ID = "0199a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b"

const details = (overrides: Record<string, unknown> = {}) => ({
  unitId: UNIT_ID,
  startMileage: "1000",
  endMileage: "1350",
  distanceKm: "350",
  vehicleConsumptionRate: "3.5",
  actualFuelConsumed: "500000",
  consumedFuelRates: [{ value: "5000" }],
  ...overrides,
})

const issues = (input: unknown) => {
  const result = recordShipmentDetailsSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("recordShipmentDetailsSchema", () => {
  it("accepts a reading and one fuel price", () => {
    expect(issues(details())).toEqual([])
  })

  it("needs at least one fuel price above zero", () => {
    expect(issues(details({ consumedFuelRates: [] }))).toContain(
      "consumedFuelRates"
    )
    expect(
      issues(details({ consumedFuelRates: [{ value: undefined }] }))
    ).toContain("consumedFuelRates")
    expect(issues(details({ consumedFuelRates: [{ value: "0" }] }))).toContain(
      "consumedFuelRates"
    )
  })

  it("ignores empty rows next to a real price", () => {
    expect(
      issues(
        details({
          consumedFuelRates: [{ value: undefined }, { value: "4800" }],
        })
      )
    ).toEqual([])
  })

  it("refuses an end reading below the start", () => {
    expect(issues(details({ endMileage: "900" }))).toContain("endMileage")
  })

  it("needs the end reading", () => {
    expect(issues(details({ endMileage: "" }))).toContain("endMileage")
  })

  it("refuses an end date in the future", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    expect(issues(details({ endedAt: tomorrow }))).toContain("endedAt")
    expect(issues(details({ endedAt: new Date(Date.now() - 60_000) }))).toEqual(
      []
    )
  })
})

describe("endShipmentSchema", () => {
  it("refuses an end date in the future", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const result = endShipmentSchema.safeParse({
      unitId: UNIT_ID,
      endMileage: 1350,
      endedAt: tomorrow,
    })

    expect(result.success).toBe(false)
  })

  it("accepts a trip that ended a moment ago", () => {
    const result = endShipmentSchema.safeParse({
      unitId: UNIT_ID,
      endMileage: 1350,
      endedAt: new Date(Date.now() - 60_000),
    })

    expect(result.success).toBe(true)
  })
})
