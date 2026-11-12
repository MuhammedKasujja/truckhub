import { describe, expect, it } from "vitest"
import { LoadingOffloadingPricingSchema } from "../../src/features/settings/pricing/schemas"

type Row = {
  tonnage_min: string
  tonnage_max: string
  cbm_min: string
  cbm_max: string
  loading_fees: string
  offloading_fees: string
}

const row = (
  tonnage: [string, string],
  cbm: [string, string],
  fees: [string, string] = ["1000", "2000"]
): Row => ({
  tonnage_min: tonnage[0],
  tonnage_max: tonnage[1],
  cbm_min: cbm[0],
  cbm_max: cbm[1],
  loading_fees: fees[0],
  offloading_fees: fees[1],
})

const parse = (pricings: Row[]) =>
  LoadingOffloadingPricingSchema.safeParse({
    effective_date: "2026-11-12",
    pricings,
  })

/** Issues as "path: message" strings, for readable assertions. */
const issuesOf = (pricings: Row[]) =>
  parse(pricings).error?.issues.map(
    (i) => `${i.path.join(".")}: ${i.message}`
  ) ?? []

// Same tiers as the form's default list
const defaultRows = [
  row(["2", "3"], ["6", "9"]),
  row(["4", "6"], ["10", "21"]),
  row(["7", "8"], ["22", "32"]),
  row(["9", "10"], ["33", "40"]),
  row(["11", "13"], ["41", "50"]),
  row(["14", "18"], ["51", "60"]),
  row(["19", "25"], ["61", "76"]),
]

describe("LoadingOffloadingPricingSchema ranges", () => {
  it("accepts the default tiers", () => {
    expect(parse(defaultRows).success).toBe(true)
  })

  it("rejects tonnage max that is not above min", () => {
    expect(issuesOf([row(["5", "5"], ["1", "2"])])).toEqual([
      "pricings.0.tonnage_max: Must be above min",
    ])
    expect(issuesOf([row(["6", "5"], ["1", "2"])])).toEqual([
      "pricings.0.tonnage_max: Must be above min",
    ])
  })

  it("rejects CBM max that is not above min", () => {
    expect(issuesOf([row(["1", "2"], ["9", "6"])])).toEqual([
      "pricings.0.cbm_max: Must be above min",
    ])
  })

  it("treats a shared boundary as an overlap", () => {
    expect(
      issuesOf([row(["2", "3"], ["1", "2"]), row(["3", "6"], ["3", "4"])])
    ).toEqual(["pricings.1.tonnage_min: Overlaps 2–3"])
  })

  it("accepts non-overlapping rows in any order", () => {
    expect(
      parse([row(["4", "6"], ["10", "20"]), row(["2", "3"], ["1", "9"])])
        .success
    ).toBe(true)
  })

  it("catches every range inside a wide range", () => {
    expect(
      issuesOf([
        row(["0", "100"], ["1", "2"]),
        row(["10", "20"], ["3", "4"]),
        row(["30", "40"], ["5", "6"]),
      ])
    ).toEqual([
      "pricings.1.tonnage_min: Overlaps 0–100",
      "pricings.2.tonnage_min: Overlaps 0–100",
    ])
  })

  it("reports CBM overlaps on their own", () => {
    expect(
      issuesOf([row(["1", "2"], ["5", "10"]), row(["3", "4"], ["8", "12"])])
    ).toEqual(["pricings.1.cbm_min: Overlaps 5–10"])
  })

  it("reports range errors while fees are still empty", () => {
    const issues = issuesOf([
      row(["2", "3"], ["1", "2"], ["", ""]),
      row(["3", "6"], ["3", "1"], ["", ""]),
    ])
    expect(issues).toContain("pricings.1.tonnage_min: Overlaps 2–3")
    expect(issues).toContain("pricings.1.cbm_max: Must be above min")
  })

  it("rejects non-numeric bounds without crashing", () => {
    const issues = issuesOf([
      row(["abc", "3"], ["1", "2"]),
      row(["2", "4"], ["3", "4"]),
    ])
    expect(issues).toContain("pricings.0.tonnage_min: Invalid number")
    // The invalid row is skipped for the range checks
    expect(issues.some((i) => i.includes("Overlaps"))).toBe(false)
  })
})
