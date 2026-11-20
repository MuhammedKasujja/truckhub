import { describe, expect, it } from "vitest"
import {
  DashboardSearchParams,
  previousPeriodLabel,
  resolveDashboardPeriod,
} from "../../src/features/dashboard/schemas"

// Fixed "now": Saturday 7 Nov 2026, mid-afternoon local time
const now = new Date(2026, 10, 7, 15, 30)

describe("DashboardSearchParams", () => {
  it("defaults to the last 30 days", () => {
    expect(DashboardSearchParams.parse({})).toEqual({ range: "30d" })
  })

  it("rejects unknown ranges", () => {
    expect(DashboardSearchParams.safeParse({ range: "1y" }).success).toBe(false)
  })
})

describe("resolveDashboardPeriod", () => {
  it.each([
    ["today", "2026-11-07"],
    ["7d", "2026-11-01"],
    ["30d", "2026-10-09"],
    ["mtd", "2026-11-01"],
  ] as const)("%s starts on %s and ends today", (range, from) => {
    expect(resolveDashboardPeriod({ range }, now)).toEqual({
      from,
      to: "2026-11-07",
    })
  })

  it("uses explicit dates for a custom range", () => {
    expect(
      resolveDashboardPeriod(
        { range: "custom", from: "2026-09-01", to: "2026-09-15" },
        now
      )
    ).toEqual({ from: "2026-09-01", to: "2026-09-15" })
  })

  it("falls back to 30 days when a custom range has no dates", () => {
    expect(resolveDashboardPeriod({ range: "custom" }, now)).toEqual({
      from: "2026-10-09",
      to: "2026-11-07",
    })
  })
})

describe("previousPeriodLabel", () => {
  it("says yesterday for a single day", () => {
    expect(previousPeriodLabel({ from: "2026-11-07", to: "2026-11-07" })).toBe(
      "vs yesterday"
    )
  })

  it("counts days inclusively", () => {
    expect(previousPeriodLabel({ from: "2026-11-01", to: "2026-11-07" })).toBe(
      "vs previous 7 days"
    )
  })
})
