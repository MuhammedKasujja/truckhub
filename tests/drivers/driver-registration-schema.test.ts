import { describe, expect, it } from "vitest"
import type { DriverFormValues } from "@/features/drivers/components/driver-registration-form"
import {
  buildDriverSchema,
  driverSchema,
  toDriverCreatePayload,
} from "@/features/drivers/components/driver-registration-form"

/** Paths of the issues the schema reports, e.g. "vehicleTypes.1.yearsExperience". */
function issuePaths(input: Record<string, unknown>, schema = driverSchema) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

function issueFor(input: Record<string, unknown>, path: string) {
  const result = driverSchema.safeParse(input)
  return result.success
    ? undefined
    : result.error.issues.find((i) => i.path.join(".") === path)?.message
}

describe("driver registration schema: vehicle types and licence", () => {
  it("requires at least one vehicle type", () => {
    expect(issuePaths({ vehicleTypes: [], licenseClasses: [] })).toContain(
      "vehicleTypes"
    )
  })

  it("requires the policy's minimum years on each vehicle type", () => {
    const paths = issuePaths({
      vehicleTypes: [
        { vehicleType: "minibus", yearsExperience: 6 },
        { vehicleType: "car", yearsExperience: 1 },
      ],
      licenseClasses: ["minibus", "car"],
    })
    expect(paths).toContain("vehicleTypes.1.yearsExperience")
    expect(paths).not.toContain("vehicleTypes.0.yearsExperience")
  })

  it("takes the experience and age limits from the policy", () => {
    const strict = buildDriverSchema({
      minAge: 30,
      maxAge: 50,
      minExperienceYears: 5,
    })
    const paths = issuePaths(
      {
        dateOfBirth: "2000-01-01",
        vehicleTypes: [{ vehicleType: "car", yearsExperience: 3 }],
        licenseClasses: ["car"],
      },
      strict
    )
    expect(paths).toContain("vehicleTypes.0.yearsExperience")
    expect(paths).toContain("dateOfBirth")
  })

  it("rejects the same vehicle type twice", () => {
    expect(
      issuePaths({
        vehicleTypes: [
          { vehicleType: "car", yearsExperience: 3 },
          { vehicleType: "car", yearsExperience: 4 },
        ],
        licenseClasses: ["car"],
      })
    ).toContain("vehicleTypes.1.vehicleType")
  })

  it("flags vehicle types the licence doesn't cover, by label", () => {
    const message = issueFor(
      {
        vehicleTypes: [
          { vehicleType: "minibus", yearsExperience: 6 },
          { vehicleType: "pickup_van", yearsExperience: 3 },
        ],
        licenseClasses: ["minibus", "car"],
      },
      "licenseClasses"
    )
    expect(message).toBe(
      "Licence must cover every assigned vehicle type: Pickup / Van"
    )
  })

  it("accepts a licence that covers every vehicle type", () => {
    expect(
      issuePaths({
        vehicleTypes: [
          { vehicleType: "minibus", yearsExperience: 6 },
          { vehicleType: "car", yearsExperience: 2 },
        ],
        licenseClasses: ["car", "minibus", "bus"],
      })
    ).not.toContain("licenseClasses")
  })

  it("requires the yard only when yards are set up", () => {
    expect(issuePaths({})).toContain("yardId")
    const noYards = buildDriverSchema(undefined, "create", {
      requireYard: false,
    })
    expect(issuePaths({}, noYards)).not.toContain("yardId")
  })

  it("requires details for a Yes health answer", () => {
    expect(issuePaths({ vision: "yes", visionDetails: " " })).toContain(
      "visionDetails"
    )
    expect(
      issuePaths({ vision: "yes", visionDetails: "Wears glasses" })
    ).not.toContain("visionDetails")
  })
})

describe("toDriverCreatePayload", () => {
  const values = {
    fullName: "  Jane Doe ",
    phone: "0700000000",
    nationalId: "CM123",
    dateOfBirth: "1990-01-01",
    yardId: 3,
    vehicleTypes: [{ vehicleType: "truck", yearsExperience: 4 }],
    education: "o_level",
    smoker: false,
    drugUser: false,
    licenseNumber: " DL-1 ",
    licenseClasses: ["truck", "car"],
    licenseExpiry: "2030-01-01",
    vision: "yes",
    visionDetails: " Glasses ",
    seriousIllness: "no",
    seriousIllnessDetails: "ignored",
    drugAlcoholTest: "pending",
    skillsTest: "passed",
    practicalTest: "pending",
    driverConfirmed: true,
  } as unknown as DriverFormValues

  it("maps form values to the API body", () => {
    const { payload } = toDriverCreatePayload(values)
    expect(payload).toMatchObject({
      fullName: "Jane Doe",
      licenseNumber: "DL-1",
      yardId: 3,
      vehicleTypes: [{ vehicleType: "truck", yearsExperience: 4 }],
      licenseClasses: ["truck", "car"],
      isSmoker: false,
      isDrugUser: false,
      skillsTest: "passed",
    })
  })

  it("keys health answers by snake_case code and drops details for No", () => {
    const { payload } = toDriverCreatePayload(values)
    expect(payload.health.vision).toEqual({ answer: true, details: "Glasses" })
    expect(payload.health.serious_illness).toEqual({
      answer: false,
      details: null,
    })
  })
})
