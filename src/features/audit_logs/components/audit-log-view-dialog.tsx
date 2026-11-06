import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createAuditLogsDetailsQueryOptions } from "../query-options"
import {
  formatAuditValue,
  getAuditDiff,
  getRecordLabel,
  humanize,
} from "../utils"
import { AuditActionBadge, AuditActor } from "./audit-log-parts"
import type { AuditDiffEntry } from "../utils"
import type { AuditLog } from "../types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type AuditLogViewDialogProps = {
  audit?: AuditLog
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Side panel with the log's metadata and a field-by-field before/after diff. */
export function AuditLogViewDialog({
  audit,
  open,
  onOpenChange,
}: AuditLogViewDialogProps) {
  const { data, isFetching } = useQuery({
    ...createAuditLogsDetailsQueryOptions(audit?.id ?? ""),
    enabled: open && !!audit?.id,
  })
  // Render the row we already have immediately; details refine it when loaded
  const log = data?.data ?? audit
  const [changedOnly, setChangedOnly] = useState(true)

  const diff = useMemo(() => (log ? getAuditDiff(log) : []), [log])
  const changedCount = diff.filter((e) => e.changed).length
  const rows =
    changedOnly && changedCount ? diff.filter((e) => e.changed) : diff
  const mode: DiffMode =
    log && !log.before ? "created" : log && !log.after ? "deleted" : "diff"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            {log && <AuditActionBadge action={log.action} />}
            {isFetching && (
              <Spinner className="size-3.5 text-muted-foreground" />
            )}
          </div>
          <SheetTitle className="text-lg">
            {humanize(log?.resource_type) || "Audit entry"}
            {log && getRecordLabel(log) && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {getRecordLabel(log)}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {log ? formatDateTime(log.created_at) : null}
          </SheetDescription>
        </SheetHeader>

        {log && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <dt className="mb-1.5 text-xs text-muted-foreground">
                  Performed by
                </dt>
                <dd>
                  <AuditActor log={log} />
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 text-xs text-muted-foreground">
                  Fields changed
                </dt>
                <dd className="font-medium tabular-nums">
                  {mode === "diff" ? changedCount : diff.length}
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 text-xs text-muted-foreground">Log ID</dt>
                <dd className="truncate font-mono text-xs">{String(log.id)}</dd>
              </div>
              <div>
                <dt className="mb-1.5 text-xs text-muted-foreground">
                  User ID
                </dt>
                <dd className="truncate font-mono text-xs">
                  {log.user_id ? String(log.user_id) : "—"}
                </dd>
              </div>
            </dl>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {mode === "created"
                    ? "Created with"
                    : mode === "deleted"
                      ? "Values at deletion"
                      : "Changes"}
                </h3>
                {mode === "diff" && changedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="audit-changed-only"
                      checked={changedOnly}
                      onCheckedChange={setChangedOnly}
                    />
                    <Label
                      htmlFor="audit-changed-only"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      Changed fields only
                    </Label>
                  </div>
                )}
              </div>

              {rows.length ? (
                <AuditDiffTable rows={rows} mode={mode} />
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No field data was recorded for this entry.
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

type DiffMode = "diff" | "created" | "deleted"

function AuditDiffTable({
  rows,
  mode,
}: {
  rows: AuditDiffEntry[]
  mode: DiffMode
}) {
  const showBefore = mode !== "created"
  const showAfter = mode !== "deleted"

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="w-1/4 px-3 py-2 text-start font-medium">Field</th>
            {showBefore && (
              <th className="px-3 py-2 text-start font-medium">Before</th>
            )}
            {showAfter && (
              <th className="px-3 py-2 text-start font-medium">After</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr
              key={row.field}
              className={cn(mode === "diff" && !row.changed && "opacity-60")}
            >
              <td className="px-3 py-2 align-top font-medium break-words">
                {humanize(row.field)}
              </td>
              {showBefore && (
                <td className="px-3 py-2 align-top">
                  <AuditValue
                    value={row.before}
                    variant={
                      mode === "diff" && row.changed ? "removed" : "plain"
                    }
                  />
                </td>
              )}
              {showAfter && (
                <td className="px-3 py-2 align-top">
                  <AuditValue
                    value={row.after}
                    variant={mode === "diff" && row.changed ? "added" : "plain"}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AuditValue({
  value,
  variant,
}: {
  value: unknown
  variant: "plain" | "added" | "removed"
}) {
  const text = formatAuditValue(value)
  if (!text) return <span className="text-muted-foreground">—</span>

  const isBlock = typeof value === "object" && value !== null
  const Tag = isBlock ? "pre" : "span"

  return (
    <Tag
      className={cn(
        "rounded px-1.5 py-0.5 break-words whitespace-pre-wrap",
        isBlock && "block max-h-48 overflow-auto font-mono text-xs",
        variant === "added" && "bg-success/10 text-success",
        variant === "removed" &&
          "bg-destructive/10 text-destructive line-through decoration-destructive/40",
        variant === "plain" && isBlock && "bg-muted/50"
      )}
    >
      {text}
    </Tag>
  )
}
