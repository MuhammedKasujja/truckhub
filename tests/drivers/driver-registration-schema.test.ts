import { describe, expect, it } from "vitest"
import type {
  DriverFormValues,
  DriverCreateSchemaType,
} from "@/features/drivers/schemas"
import {
  apiFieldToFormField,
  toDriverCreatePayload,
} from "@/features/drivers/components/driver-registration-form"
import {
  driverRequestInput,
  toDriverApiFormData,
  toDriverRequestFormData,
} from "@/features/drivers/driver-form-data"
import {
  driverSchema,
  buildDriverSchema,
  DriverCreateSchema,
  DriverUpdateSchema,
} from "@/features/drivers/schemas"

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
  const licenseCopy = new File(["x"], "licence.pdf", {
    type: "application/pdf",
  })
  const signedQuestionnaire = new File(["x"], "form.jpg", {
    type: "image/jpeg",
  })
  const values = {
    fullName: "  Jane Doe ",
    phone: "0700000000",
    email: " jane@example.com ",
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
    licenseCopy,
    signedQuestionnaire,
  } as unknown as DriverFormValues

  it("maps form values to the API body", () => {
    const { payload } = toDriverCreatePayload(values)
    expect(payload).toEqual({
      full_name: "Jane Doe",
      phone: "0700000000",
      email: "jane@example.com",
      national_id: "CM123",
      date_of_birth: "1990-01-01",
      yard_id: 3,
      vehicle_types: [{ vehicle_type: "truck", years_experience: 4 }],
      education: "o_level",
      is_smoker: false,
      is_drug_user: false,
      license_number: "DL-1",
      license_classes: ["truck", "car"],
      license_expiry: "2030-01-01",
      health: expect.any(Object),
      drug_alcohol_test: "pending",
      skills_test: "passed",
      practical_test: "pending",
      driver_confirmed: true,
      license_copy: licenseCopy,
      signed_questionnaire: signedQuestionnaire,
    })
  })

  it("requires a licence copy to create, but not to update or for the questionnaire", () => {
    const { payload } = toDriverCreatePayload({
      ...values,
      licenseCopy: undefined,
      signedQuestionnaire: undefined,
    })
    expect(DriverCreateSchema.safeParse(payload).success).toBe(false)
    expect(
      DriverCreateSchema.safeParse({ ...payload, license_copy: licenseCopy })
        .success
    ).toBe(true)
    expect(
      DriverUpdateSchema.safeParse({ id: "driver-1", ...payload }).success
    ).toBe(true)
  })

  it("accepts the same document types on the form and the API", () => {
    const document = (type: string, size = 10) =>
      new File([new Uint8Array(size)], "doc", { type })
    const { payload } = toDriverCreatePayload(values)
    const accepts = (file: File) =>
      DriverCreateSchema.safeParse({ ...payload, license_copy: file }).success

    expect(accepts(document("application/pdf"))).toBe(true)
    expect(accepts(document("image/jpeg"))).toBe(true)
    expect(accepts(document("image/png"))).toBe(true)
    expect(accepts(document("text/plain"))).toBe(false)
    expect(accepts(document("application/pdf", 5 * 1024 * 1024 + 1))).toBe(false)
  })

  it("keys health answers by snake_case code and drops details for No", () => {
    const { payload } = toDriverCreatePayload(values)
    expect(payload.health.vision).toEqual({ answer: true, details: "Glasses" })
    expect(payload.health.serious_illness).toEqual({
      answer: false,
      details: null,
    })
  })

  it("produces a body DriverCreateSchema keeps whole", () => {
    const { payload } = toDriverCreatePayload(values)
    expect(DriverCreateSchema.parse(payload)).toEqual(payload)
  })

  it("lets DriverUpdateSchema keep an id and the whole body", () => {
    const { payload } = toDriverCreatePayload(values)
    const body = { id: "driver-1", ...payload }
    expect(DriverUpdateSchema.parse(body)).toEqual(body)
    expect(DriverUpdateSchema.safeParse({ phone: "0700000000" }).success).toBe(false)
  })
})

describe("driver avatar", () => {
  const avatarErrors = (avatar: unknown) => {
    const result = driverSchema.safeParse({ avatar })
    return result.success
      ? []
      : result.error.issues.filter((i) => i.path[0] === "avatar")
  }
  const file = (type: string, size = 10) =>
    new File([new Uint8Array(size)], "photo", { type })

  it("is optional, and null means removed", () => {
    expect(avatarErrors(undefined)).toEqual([])
    expect(avatarErrors(null)).toEqual([])
  })

  it("accepts images only", () => {
    expect(avatarErrors(file("image/jpeg"))).toEqual([])
    expect(avatarErrors(file("image/webp"))).toEqual([])
    expect(avatarErrors(file("application/pdf"))[0].message).toBe(
      "Upload a JPG, PNG or WEBP"
    )
  })

  it("rejects files over 5MB", () => {
    expect(
      avatarErrors(file("image/jpeg", 5 * 1024 * 1024 + 1))[0].message
    ).toBe("File must be 5MB or smaller")
  })

  const base = {
    fullName: "Jane Doe",
    phone: "0700000000",
    email: "jane@example.com",
    nationalId: "CM123",
    licenseNumber: "DL-1",
    vehicleTypes: [],
  }

  it("goes in the body with the other fields", () => {
    const avatar = file("image/jpeg")
    const { payload } = toDriverCreatePayload({
      ...base,
      avatar,
    } as unknown as DriverFormValues)
    expect(payload.avatar).toBe(avatar)
    expect(DriverCreateSchema.shape).toHaveProperty("avatar")
  })

  it("leaves a removed photo out of the body", () => {
    const { payload } = toDriverCreatePayload({
      ...base,
      avatar: null,
    } as unknown as DriverFormValues)
    expect(payload.avatar).toBeUndefined()
  })
})

describe("driver email", () => {
  it("is required and must be valid", () => {
    expect(issueFor({ email: "" }, "email")).toBe("Enter a valid email address")
    expect(issueFor({ email: "jane" }, "email")).toBe(
      "Enter a valid email address"
    )
    expect(issueFor({ email: " jane@example.com " }, "email")).toBeUndefined()
  })
})

describe("driver request form data", () => {
  const avatar = new File(["x"], "avatar.jpg", { type: "image/jpeg" })
  const license_copy = new File(["x"], "licence.pdf", {
    type: "application/pdf",
  })
  const signed_questionnaire = new File(["x"], "form.pdf", {
    type: "application/pdf",
  })
  const body = {
    full_name: "Jane Doe",
    phone: "0700000000",
    email: "jane@example.com",
    national_id: "CM123",
    date_of_birth: "1990-01-01",
    yard_id: 3,
    vehicle_types: [{ vehicle_type: "truck", years_experience: 4 }],
    education: "o_level",
    is_smoker: false,
    is_drug_user: false,
    license_number: "DL-1",
    license_classes: ["truck"],
    license_expiry: "2030-01-01",
    health: { vision: { answer: true, details: "Glasses" } },
    drug_alcohol_test: "pending",
    skills_test: "passed",
    practical_test: "pending",
    driver_confirmed: true,
  }
  const files = { avatar, license_copy, signed_questionnaire }
  const request = { ...body, ...files } as DriverCreateSchemaType

  it("reaches the server function with its types and every file intact", () => {
    const parse = driverRequestInput(DriverCreateSchema)
    const parsed = parse(toDriverRequestFormData(request))
    expect(parsed).toEqual({
      ...body,
      avatar: expect.any(File),
      license_copy: expect.any(File),
      signed_questionnaire: expect.any(File),
    })
    expect(parsed.avatar?.name).toBe("avatar.jpg")
    expect(parsed.license_copy.name).toBe("licence.pdf")
    expect(parsed.signed_questionnaire?.name).toBe("form.pdf")
  })

  it("keeps files out of the JSON part", () => {
    const fields = String(toDriverRequestFormData(request).get("fields"))
    expect(JSON.parse(fields)).toEqual(body)
  })

  it("works without a photo, and keeps the id on updates", () => {
    const parse = driverRequestInput(DriverUpdateSchema)
    expect(parse(toDriverRequestFormData({ id: "driver-1", phone: "0700000000" }))).toEqual({
      id: "driver-1",
      phone: "0700000000",
    })
  })

  it("rejects an invalid body and anything that isn't form data", () => {
    const parse = driverRequestInput(DriverCreateSchema)
    expect(() => parse(toDriverRequestFormData({ phone: "1" }))).toThrow()
    expect(() => parse(body)).toThrow("Expected FormData")
  })

  it("sends the API one part per field", () => {
    const fd = toDriverApiFormData({ ...request, nothing: undefined })
    expect(fd.get("full_name")).toBe("Jane Doe")
    expect(fd.get("yard_id")).toBe("3")
    expect(fd.get("is_smoker")).toBe("false")
    expect(JSON.parse(String(fd.get("vehicle_types")))).toEqual(body.vehicle_types)
    expect(JSON.parse(String(fd.get("license_classes")))).toEqual(["truck"])
    expect(JSON.parse(String(fd.get("health")))).toEqual(body.health)
    expect((fd.get("avatar") as File).name).toBe("avatar.jpg")
    expect((fd.get("license_copy") as File).name).toBe("licence.pdf")
    expect((fd.get("signed_questionnaire") as File).name).toBe("form.pdf")
    expect(fd.has("nothing")).toBe(false)
  })
})

describe("apiFieldToFormField", () => {
  it.each([
    ["phone", "phone"],
    ["full_name", "fullName"],
    ["date_of_birth", "dateOfBirth"],
    ["is_smoker", "smoker"],
    ["is_drug_user", "drugUser"],
    ["vehicle_types", "vehicleTypes"],
    ["vehicle_types.0.years_experience", "vehicleTypes.0.yearsExperience"],
    ["health.vision.answer", "vision"],
    ["health.serious_illness", "seriousIllness"],
    ["health.serious_illness.details", "seriousIllnessDetails"],
  ])("puts an error on %s on the form's %s field", (api, form) => {
    expect(apiFieldToFormField(api)).toBe(form)
  })
})
