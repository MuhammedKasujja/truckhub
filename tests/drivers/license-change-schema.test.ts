import { describe, expect, it } from "vitest"
import {
  LicenseChangeRequestSchema,
  buildDriverSchema,
  buildLicenseChangeSchema,
  todayDateInput,
} from "@/features/drivers/schemas"
import {
  driverRequestInput,
  toDriverApiFormData,
  toDriverRequestFormData,
} from "@/features/drivers/driver-form-data"

const nextYear = `${new Date().getFullYear() + 1}-06-30`
const copy = new File(["x"], "licence.pdf", { type: "application/pdf" })

const valid = {
  licenseNumber: "UG-12345",
  licenseClasses: ["car", "truck"],
  expiryDate: nextYear,
  effectiveFrom: "",
  reason: "renewal",
  notes: "",
  licenseCopy: copy,
}

function issues(input: Record<string, unknown>, needed = ["car", "truck"]) {
  const result = buildLicenseChangeSchema(needed as never).safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((i) => [i.path.join("."), i.message])
      )
}

describe("licence change schema", () => {
  it("accepts a renewal that covers every vehicle type", () => {
    expect(issues(valid)).toEqual({})
  })

  it("rejects an expiry date of today or earlier", () => {
    expect(issues({ ...valid, expiryDate: todayDateInput() })).toHaveProperty(
      "expiryDate",
      "Licence has expired"
    )
  })

  it("requires the photocopy and a reason", () => {
    const found = issues({ ...valid, licenseCopy: undefined, reason: "" })
    expect(found).toHaveProperty("licenseCopy")
    expect(found).toHaveProperty("reason")
  })

  it("does not offer 'initial' as a reason", () => {
    expect(issues({ ...valid, reason: "initial" })).toHaveProperty("reason")
  })

  it("needs a note when the licence leaves a vehicle type uncovered", () => {
    const gap = { ...valid, licenseClasses: ["car"] }
    expect(issues(gap).notes).toMatch(/Truck/)
    expect(issues({ ...gap, notes: "Truck test booked" })).toEqual({})
  })
})

describe("licence change request", () => {
  it("survives the browser to server function round trip with its file", () => {
    const request = {
      id: "3f6c2b1e-8a4d-4c1b-9e2f-1a2b3c4d5e6f",
      license_number: "UG-12345",
      license_classes: ["car" as const],
      expiry_date: nextYear,
      reason: "category_change" as const,
      notes: "Dropped truck",
      license_copy: copy,
    }
    const parsed = driverRequestInput(LicenseChangeRequestSchema)(
      toDriverRequestFormData(request)
    )
    expect(parsed).toMatchObject({ ...request, license_copy: expect.any(File) })

    const { id: _id, ...fields } = parsed
    const api = toDriverApiFormData(fields)
    expect(api.get("license_classes")).toBe('["car"]')
    expect(api.get("license_copy")).toBeInstanceOf(File)
    expect(api.has("effective_from")).toBe(false)
  })
})

describe("driver edit schema: licence is read-only", () => {
  it("does not block saving a driver whose licence has expired or has a gap", () => {
    const schema = buildDriverSchema(undefined, "edit", { requireYard: false })
    const result = schema.safeParse({
      vehicleTypes: [{ vehicleType: "truck", yearsExperience: 10 }],
      licenseNumber: "UG-12345",
      licenseClasses: ["car"],
      licenseExpiry: "2020-01-01",
    })
    const paths = result.success
      ? []
      : result.error.issues.map((i) => i.path.join("."))
    expect(paths).not.toContain("licenseExpiry")
    expect(paths).not.toContain("licenseClasses")
  })
})
