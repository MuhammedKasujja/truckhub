import type { AuditLog } from "./types"

export type AuditActionTone =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "other"

/** Maps free-form backend action names (e.g. "created", "invoice.update") to a visual tone. */
export function getActionTone(action: string): AuditActionTone {
  const a = action.toLowerCase()
  if (/(creat|add|insert|store|register)/.test(a)) return "create"
  if (/(delet|remov|destroy|void|cancel|revers)/.test(a)) return "delete"
  if (/(approv|accept|confirm|complet|dispatch)/.test(a)) return "approve"
  if (/(updat|edit|chang|modif|assign|patch)/.test(a)) return "update"
  return "other"
}

export const actionToneClasses: Record<AuditActionTone, string> = {
  create: "border-success/30 bg-success/10 text-success",
  update: "border-info/30 bg-info/10 text-info",
  delete: "border-destructive/30 bg-destructive/10 text-destructive",
  approve: "border-primary/30 bg-primary/10 text-primary",
  other: "border-border bg-muted text-muted-foreground",
}

export const humanize = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())

export function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase()
}

/** Fields that change on every write and only add noise to a diff. */
const NOISY_FIELDS = new Set(["updated_at", "last_updated_at"])

export type AuditDiffEntry = {
  field: string
  before: unknown
  after: unknown
  changed: boolean
}

const isEqual = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

export function getAuditDiff(log: Pick<AuditLog, "before" | "after">) {
  const before = log.before ?? {}
  const after = log.after ?? {}
  const fields = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  )

  return fields
    .map<AuditDiffEntry>((field) => ({
      field,
      before: before[field],
      after: after[field],
      changed:
        !NOISY_FIELDS.has(field) && !isEqual(before[field], after[field]),
    }))
    .sort((a, b) => Number(b.changed) - Number(a.changed))
}

export function countChangedFields(log: Pick<AuditLog, "before" | "after">) {
  return getAuditDiff(log).filter((e) => e.changed).length
}

/** A record identifier pulled from the payload, if one is present. */
export function getRecordLabel(log: Pick<AuditLog, "before" | "after">) {
  const source = log.after ?? log.before ?? {}
  const value = source.number ?? source.name ?? source.plate_number ?? source.id
  return value === undefined || value === null ? null : String(value)
}

export function formatAuditValue(value: unknown): string {
  if (value === undefined) return ""
  if (value === null || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}
