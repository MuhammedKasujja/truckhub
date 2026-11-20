import { describe, expect, it } from "vitest"
import {
  createDocumentTypeSchema,
  toDocumentTypeCode,
  toMaxSizeBytes,
  toMaxSizeMb,
  uploadDocumentSchema,
  voidDocumentSchema,
} from "../../src/features/documents/schemas"

const ID = "0199a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b"

const newType = (overrides: Record<string, unknown> = {}) => ({
  code: "medical_certificate",
  name: "Medical certificate",
  ownerKind: "driver",
  isRequired: true,
  requiresExpiry: true,
  isRestricted: false,
  allowedContentTypes: ["application/pdf"],
  maxSizeMb: 5,
  sortOrder: 0,
  ...overrides,
})

const failedFields = (
  schema: { safeParse: (v: unknown) => any },
  input: unknown
) => {
  const result = schema.safeParse(input)
  return result.success
    ? []
    : result.error.issues.map((i: { path: unknown[] }) => i.path.join("."))
}

describe("createDocumentTypeSchema", () => {
  it("accepts a well-formed type", () => {
    expect(failedFields(createDocumentTypeSchema, newType())).toEqual([])
  })

  it("keeps the code to what the API accepts", () => {
    for (const code of ["Medical", "1st_form", "medical-cert", "m"]) {
      expect(
        failedFields(createDocumentTypeSchema, newType({ code }))
      ).toContain("code")
    }
  })

  it("needs at least one allowed file type, and only known ones", () => {
    expect(
      failedFields(
        createDocumentTypeSchema,
        newType({ allowedContentTypes: [] })
      )
    ).toContain("allowedContentTypes")
    expect(
      failedFields(
        createDocumentTypeSchema,
        newType({ allowedContentTypes: ["application/zip"] })
      )
    ).toContain("allowedContentTypes.0")
  })

  it("needs a size above zero", () => {
    expect(
      failedFields(createDocumentTypeSchema, newType({ maxSizeMb: 0 }))
    ).toContain("maxSizeMb")
  })
})

describe("document type helpers", () => {
  it("suggests a code from a name", () => {
    expect(toDocumentTypeCode("Medical certificate")).toBe(
      "medical_certificate"
    )
    expect(toDocumentTypeCode("  3rd-party Insurance (2026) ")).toBe(
      "rd_party_insurance_2026"
    )
  })

  it("converts megabytes to bytes and back", () => {
    expect(toMaxSizeBytes(5)).toBe(5 * 1024 * 1024)
    expect(toMaxSizeMb(5 * 1024 * 1024)).toBe(5)
    expect(toMaxSizeMb(toMaxSizeBytes(2.5))).toBe(2.5)
  })
})

describe("uploadDocumentSchema", () => {
  const upload = (overrides: Record<string, unknown> = {}) => ({
    ownerKind: "driver",
    ownerId: ID,
    documentTypeCode: "medical_certificate",
    file: new File(["%PDF-1.7"], "medical.pdf", { type: "application/pdf" }),
    ...overrides,
  })

  it("accepts a file with or without an expiry date", () => {
    expect(failedFields(uploadDocumentSchema, upload())).toEqual([])
    expect(
      failedFields(uploadDocumentSchema, upload({ expiresOn: "2027-03-31" }))
    ).toEqual([])
  })

  it("needs a file and a calendar date", () => {
    expect(
      failedFields(uploadDocumentSchema, upload({ file: undefined }))
    ).toContain("file")
    expect(
      failedFields(uploadDocumentSchema, upload({ expiresOn: "31/03/2027" }))
    ).toContain("expiresOn")
  })
})

describe("voidDocumentSchema", () => {
  it("needs a reason", () => {
    const input = { ownerKind: "driver", ownerId: ID, linkId: ID }

    expect(
      failedFields(voidDocumentSchema, { ...input, reason: " a " })
    ).toContain("reason")
    expect(
      failedFields(voidDocumentSchema, { ...input, reason: "Wrong file" })
    ).toEqual([])
  })
})
