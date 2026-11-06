import { describe, expect, it } from "vitest"
import {
  countChangedFields,
  getActionTone,
  getAuditDiff,
  getRecordLabel,
} from "../../src/features/audit_logs/utils"

describe("getActionTone", () => {
  it.each([
    ["created", "create"],
    ["invoice.update", "update"],
    ["DELETE", "delete"],
    ["quotation_approved", "approve"],
    ["login", "other"],
  ])("%s → %s", (action, tone) => {
    expect(getActionTone(action)).toBe(tone)
  })
})

describe("getAuditDiff", () => {
  const log = {
    before: { status: "draft", total: 100, updated_at: "a", tags: ["x"] },
    after: { status: "sent", total: 100, updated_at: "b", tags: ["x", "y"], note: "hi" },
  }

  it("flags changed fields first and ignores timestamp noise", () => {
    const diff = getAuditDiff(log)
    expect(diff.filter((d) => d.changed).map((d) => d.field)).toEqual([
      "status",
      "tags",
      "note",
    ])
    expect(diff.find((d) => d.field === "updated_at")?.changed).toBe(false)
    expect(countChangedFields(log)).toBe(3)
  })

  it("treats every field of a created record as changed", () => {
    expect(countChangedFields({ before: null, after: { a: 1, b: 2 } })).toBe(2)
  })

  it("picks a human record label from the payload", () => {
    expect(getRecordLabel({ before: null, after: { id: 9, number: "INV-1" } })).toBe("INV-1")
    expect(getRecordLabel({ before: null, after: null })).toBeNull()
  })
})
