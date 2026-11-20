import { describe, expect, it } from "vitest"
import {
  buildDocumentRows,
  canPreview,
  daysUntilDate,
  expiryLabel,
  expiryState,
  fileProblem,
  fileSizeLabel,
} from "../../src/features/documents/format"
import type {
  DocumentLink,
  DocumentType,
} from "../../src/features/documents/types"

/** 15 Nov 2026, local time. */
const TODAY = new Date(2026, 10, 15, 14, 30)

const type = (overrides: Partial<DocumentType> = {}): DocumentType => ({
  id: "type-medical",
  code: "medical_certificate",
  name: "Medical certificate",
  owner_kind: "driver",
  is_required: false,
  requires_expiry: false,
  is_restricted: false,
  allowed_content_types: ["application/pdf", "image/png"],
  max_size_bytes: 5 * 1024 * 1024,
  is_active: true,
  sort_order: 0,
  ...overrides,
})

const link = (
  id: string,
  documentType: DocumentType,
  overrides: Partial<DocumentLink> = {}
): DocumentLink => ({
  id,
  owner_kind: "driver",
  owner_id: "driver-1",
  document_type: documentType,
  original_filename: `${id}.pdf`,
  content_type: "application/pdf",
  size_bytes: 120_000,
  checksum_sha256: null,
  uploaded_at: "2026-11-01T09:00:00+00:00",
  expires_on: null,
  is_current: true,
  voided_at: null,
  void_reason: null,
  ...overrides,
})

describe("expiryState", () => {
  it("has no state without an expiry date", () => {
    expect(expiryState(null, TODAY)).toBe("none")
  })

  it("is good through the expiry date itself", () => {
    expect(expiryState("2026-11-15", TODAY)).toBe("expiring")
    expect(expiryState("2026-11-14", TODAY)).toBe("expired")
  })

  it("flags a document within thirty days of expiry", () => {
    expect(expiryState("2026-12-15", TODAY)).toBe("expiring")
    expect(expiryState("2026-12-16", TODAY)).toBe("valid")
  })
})

describe("daysUntilDate", () => {
  it("counts whole calendar days whatever the time of day", () => {
    expect(daysUntilDate("2026-11-16", TODAY)).toBe(1)
    expect(daysUntilDate("2026-11-15", TODAY)).toBe(0)
    expect(daysUntilDate("2026-11-10", TODAY)).toBe(-5)
  })
})

describe("expiryLabel", () => {
  it("says how close or how late the expiry is", () => {
    expect(expiryLabel("2026-11-15", TODAY)).toBe("Expires today")
    expect(expiryLabel("2026-11-16", TODAY)).toBe("Expires in 1 day")
    expect(expiryLabel("2026-11-12", TODAY)).toBe("Expired 3 days ago")
  })

  it("leaves a distant expiry to the caller", () => {
    expect(expiryLabel("2027-06-01", TODAY)).toBeNull()
    expect(expiryLabel(null, TODAY)).toBeNull()
  })
})

describe("fileProblem", () => {
  const medical = type()

  it("accepts a file within the type's rules", () => {
    expect(
      fileProblem({ size: 1024, type: "application/pdf" }, medical)
    ).toBeNull()
  })

  it("refuses an empty or oversized file", () => {
    expect(fileProblem({ size: 0, type: "application/pdf" }, medical)).toBe(
      "The file is empty"
    )
    expect(
      fileProblem({ size: 6 * 1024 * 1024, type: "application/pdf" }, medical)
    ).toContain("larger than 5.0 MB")
  })

  it("refuses a file type the document type does not allow", () => {
    expect(fileProblem({ size: 1024, type: "image/webp" }, medical)).toBe(
      "Only PDF, PNG files are accepted"
    )
  })

  it("leaves a file the browser cannot identify to the API", () => {
    expect(fileProblem({ size: 1024, type: "" }, medical)).toBeNull()
  })
})

describe("buildDocumentRows", () => {
  const medical = type({ is_required: true, sort_order: 2 })
  const questionnaire = type({
    id: "type-questionnaire",
    code: "driver_questionnaire",
    name: "Signed questionnaire",
    sort_order: 1,
  })
  const licenceCopy = type({
    id: "type-licence",
    code: "license_copy",
    name: "Licence copy",
    sort_order: 0,
  })

  it("lists active types in their set order", () => {
    const rows = buildDocumentRows([medical, questionnaire, licenceCopy], [])

    expect(rows.map((row) => row.type.code)).toEqual([
      "license_copy",
      "driver_questionnaire",
      "medical_certificate",
    ])
  })

  it("flags a required type with nothing in force", () => {
    const [row] = buildDocumentRows([medical], [])

    expect(row.current).toBeUndefined()
    expect(row.isMissing).toBe(true)
  })

  it("separates the version in force from the ones it replaced", () => {
    const rows = buildDocumentRows(
      [medical],
      [
        link("old", medical, {
          is_current: false,
          uploaded_at: "2026-01-01T09:00:00+00:00",
        }),
        link("new", medical, { uploaded_at: "2026-11-01T09:00:00+00:00" }),
        link("older", medical, {
          is_current: false,
          uploaded_at: "2025-06-01T09:00:00+00:00",
        }),
      ]
    )

    expect(rows[0].current?.id).toBe("new")
    expect(rows[0].history.map((l) => l.id)).toEqual(["old", "older"])
    expect(rows[0].isMissing).toBe(false)
  })

  it("does not count a voided document as in force", () => {
    const [row] = buildDocumentRows(
      [medical],
      [
        link("voided", medical, {
          voided_at: "2026-11-10T09:00:00+00:00",
          void_reason: "Wrong file",
        }),
      ]
    )

    expect(row.current).toBeUndefined()
    expect(row.history.map((l) => l.id)).toEqual(["voided"])
    expect(row.isMissing).toBe(true)
  })

  it("hides an inactive type unless it still holds files", () => {
    const retired = type({
      id: "type-retired",
      code: "old_form",
      name: "Old form",
      is_active: false,
      is_required: true,
    })

    expect(buildDocumentRows([retired], [])).toEqual([])

    const [row] = buildDocumentRows([retired], [link("kept", retired)])
    expect(row.current?.id).toBe("kept")
    // A type that takes no uploads cannot be missing
    expect(row.isMissing).toBe(false)
  })

  it("marks the licence copy as managed with the licence", () => {
    const rows = buildDocumentRows([licenceCopy, medical], [])

    expect(rows.find((r) => r.type.code === "license_copy")).toMatchObject({
      isManagedElsewhere: true,
    })
    expect(
      rows.find((r) => r.type.code === "medical_certificate")
    ).toMatchObject({ isManagedElsewhere: false })
  })
})

describe("file helpers", () => {
  it("formats sizes", () => {
    expect(fileSizeLabel(512)).toBe("512 B")
    expect(fileSizeLabel(120_000)).toBe("117 KB")
    expect(fileSizeLabel(5 * 1024 * 1024)).toBe("5.0 MB")
  })

  it("previews only what a browser can show", () => {
    expect(canPreview("application/pdf")).toBe(true)
    expect(canPreview("image/jpeg")).toBe(true)
    expect(canPreview("application/zip")).toBe(false)
  })
})
