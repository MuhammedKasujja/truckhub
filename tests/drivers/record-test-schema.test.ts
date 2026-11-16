import { describe, expect, it } from "vitest"
import {
  recordTestResultSchema,
  todayDateInput,
} from "../../src/features/drivers/schemas"

const ID = "0199a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b"

const result = (overrides: Record<string, unknown> = {}) => ({
  driverId: ID,
  testType: "driving_skills",
  status: "passed",
  testedOn: "2026-01-15",
  ...overrides,
})

const messages = (input: unknown) => {
  const parsed = recordTestResultSchema.safeParse(input)
  return parsed.success ? [] : parsed.error.issues.map((i) => i.message)
}

const dayAfter = (isoDate: string) => {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + 1)
  return date.toLocaleDateString("en-CA")
}

describe("recordTestResultSchema", () => {
  it("accepts a result with its date", () => {
    expect(recordTestResultSchema.parse(result())).toMatchObject({
      status: "passed",
      testedOn: "2026-01-15",
    })
  })

  it("needs a date once the test is passed or failed", () => {
    for (const status of ["passed", "failed"]) {
      expect(messages(result({ status, testedOn: undefined }))).toEqual([
        "Enter the date of the test",
      ])
    }
  })

  it("accepts today but not a date in the future", () => {
    const today = todayDateInput()
    expect(messages(result({ testedOn: today }))).toEqual([])
    expect(messages(result({ testedOn: dayAfter(today) }))).toEqual([
      "The test date cannot be in the future",
    ])
  })

  it("drops the date of a pending test", () => {
    const parsed = recordTestResultSchema.parse(result({ status: "pending" }))
    expect(parsed.testedOn).toBeUndefined()
  })

  it("lets a pending test have no date", () => {
    expect(messages(result({ status: "pending", testedOn: undefined }))).toEqual(
      []
    )
  })

  it("trims notes and leaves out blank ones", () => {
    expect(
      recordTestResultSchema.parse(result({ notes: "  Retest  " })).notes
    ).toBe("Retest")
    expect(
      recordTestResultSchema.parse(result({ notes: "   " })).notes
    ).toBeUndefined()
  })

  it("rejects an unknown test or a malformed date", () => {
    expect(messages(result({ testType: "eyesight" }))).toHaveLength(1)
    expect(messages(result({ testedOn: "15/01/2026" }))).toEqual([
      "Enter a valid date",
    ])
  })
})
