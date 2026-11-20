/**
 * Reads the parts of a driver record the API returns as lists (tests,
 * health responses) by key, for the details screen and the edit
 * form.
 */
import { HEALTH_QUESTIONS } from "./schemas"
import type { HealthCondition, TestType } from "./enums"
import type { Driver } from "./types"

/** The selection tests, in the order they are shown. */
export const DRIVER_TESTS = [
  {
    type: "drug_alcohol",
    label: "Drug and alcohol test",
    field: "drugAlcoholTest",
  },
  { type: "driving_skills", label: "Driving skills test", field: "skillsTest" },
  {
    type: "practical_driving",
    label: "Practical driving test",
    field: "practicalTest",
  },
] as const satisfies readonly { type: TestType; label: string; field: string }[]

/** A test's result; a test with no record yet is pending. */
export function driverTest(driver: Driver, type: TestType) {
  const test = driver.tests.find((t) => t.test_type === type)
  return {
    status: test?.status ?? "pending",
    tested_on: test?.tested_on ?? null,
    notes: test?.notes ?? null,
  }
}

/** Health condition code as the API stores it, e.g. "serious_illness". */
export const toHealthCondition = (name: string) =>
  name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) as HealthCondition

/** Every health question with the driver's answer; unanswered reads as "no". */
export function driverHealthAnswers(driver: Driver) {
  return HEALTH_QUESTIONS.map((q) => {
    const response = driver.health_screening.responses.find(
      (r) => r.condition === toHealthCondition(q.name)
    )
    return {
      ...q,
      answered: !!response,
      answer: response?.answer ?? false,
      details: response?.details ?? null,
    }
  })
}

/** "2026-03-12T00:00:00Z" -> "2026-03-12", for date inputs. */
export const toDateInput = (date: string | null | undefined) =>
  date ? date.slice(0, 10) : ""
