import React, { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CalendarRange,
  FileText,
  ListOrdered,
  Minus,
  StickyNote,
} from "lucide-react"
import type { QuotationVersion } from "@/features/quotations/types"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import {
  LineItemRow,
  QuotationDetailsPageHeader,
} from "@/features/quotations/components"
import {
  daysUntilDate,
  defaultVersion,
  periodDays,
} from "@/features/quotations/format"
import { useQuotaionDetailsSuspenseQuery } from "@/features/quotations/hooks/use-quotation"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { requirePermission } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_admin/quotations/$quotationId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  beforeLoad: () => requirePermission("quotations:view"),
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

const isActive = (v: QuotationVersion) => v.is_active || v.isActive

function RouteComponent() {
  const { quotationId } = Route.useParams()
  const { data: quotation } = useQuotaionDetailsSuspenseQuery(quotationId)

  // Oldest first, so the trail reads left to right
  const versions = useMemo(
    () =>
      [...quotation.versions].sort(
        (a, b) => a.version_number - b.version_number
      ),
    [quotation.versions]
  )

  const [selected, setSelected] = useState<number | undefined>(
    () => defaultVersion(quotation.versions)?.version_number
  )
  const v =
    versions.find((x) => x.version_number === selected) ?? versions.at(-1)
  const prev = v
    ? versions.filter((x) => x.version_number < v.version_number).at(-1)
    : undefined

  const maxTotal = Math.max(1, ...versions.map((x) => Number(x.total_amount)))

  return (
    <div className="space-y-5">
      <QuotationDetailsPageHeader quotation={quotation} />

      {!v ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          This quotation has no versions yet.
        </div>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card lg:h-[calc(100vh-15rem)] lg:min-h-[640px] lg:flex-row">
          {/* ================= Center: detail ================= */}
          <section className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
            {/* Detail header */}
            <div className="shrink-0 border-b px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" />
                    <span>{quotation.number}</span>
                    <span aria-hidden>·</span>
                    <span>
                      Client {quotation.client.number}
                      {quotation.client.short_name &&
                        ` (${quotation.client.short_name})`}
                    </span>
                  </div>
                  <h2 className="truncate text-xl font-semibold tracking-tight capitalize">
                    {quotation.client.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Issued {formatDate(quotation.created_at)}
                  </p>
                </div>
                <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {isActive(v) ? "Active version" : "Earlier version"}
                </span>
              </div>

              {/* Version trail */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Revisions · {versions.length}
                </p>
                <div className="flex items-center overflow-x-auto pb-1">
                  {versions.map((ver, i) => {
                    const isSelected = ver.version_number === v.version_number
                    return (
                      <React.Fragment key={ver.version_number}>
                        {i > 0 && (
                          <span className="h-px w-5 shrink-0 bg-border" />
                        )}
                        <button
                          type="button"
                          onClick={() => setSelected(ver.version_number)}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative flex shrink-0 flex-col items-start rounded-lg border px-3 py-1.5 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <span
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              isSelected && "text-primary"
                            )}
                          >
                            v{ver.version_number}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(ver.start_date, {
                              dateStyle: undefined,
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {isActive(ver) && (
                            <span
                              className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-foreground"
                              title="Active version"
                            />
                          )}
                        </button>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable detail body */}
            <div className="flex-1 space-y-6 bg-muted/40 p-5 sm:p-6 lg:overflow-y-auto">
              <RevisionCard version={v} previous={prev} />

              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b px-4 py-3.5">
                  <h3 className="flex items-center gap-2.5 text-base font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-lg border bg-muted/50">
                      <ListOrdered className="size-4" />
                    </span>
                    Line items
                  </h3>
                  <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                    {v.line_items.length} item
                    {v.line_items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="overflow-x-auto px-4">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="w-8 py-2.5 pr-3 font-medium">#</th>
                        <th className="py-2.5 pr-4 font-medium">Item</th>
                        <th className="px-3 py-2.5 text-right font-medium">
                          Unit price
                        </th>
                        <th className="px-3 py-2.5 text-right font-medium">
                          Qty
                        </th>
                        <th className="py-2.5 pl-3 text-right font-medium">
                          Line total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.line_items.map((item, i) => (
                        <LineItemRow item={item} idx={i} key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Line items total
                    <span className="ml-1.5 text-xs">(before tax)</span>
                  </span>
                  <span className="text-base font-bold tabular-nums">
                    {formatMoney(
                      v.line_items.reduce(
                        (sum, item) => sum + Number(item.line_total ?? 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= Right rail: totals + ledger ================= */}
          <aside className="flex shrink-0 flex-col border-t lg:w-80 lg:overflow-hidden lg:border-t-0 lg:border-l">
            <div className="border-b p-5">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Totals · v{v.version_number}
              </p>
              <dl className="space-y-2 text-sm">
                <TotalRow label="Subtotal" value={formatMoney(v.subtotal)} />
                {Number(v.discount_amount) > 0 && (
                  <TotalRow
                    label="Discount"
                    value={`−${formatMoney(v.discount_amount)}`}
                  />
                )}
                {v.tax_rates.length > 0 ? (
                  v.tax_rates.map((rate) => (
                    <TotalRow
                      key={rate.id}
                      label={`${rate.tax_name} (${Number(rate.rate)}%)`}
                      value={
                        v.tax_rates.length === 1
                          ? formatMoney(v.tax_amount)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <TotalRow label="Tax" value={formatMoney(v.tax_amount)} />
                )}
                {v.tax_rates.length > 1 && (
                  <TotalRow
                    label="Total tax"
                    value={formatMoney(v.tax_amount)}
                  />
                )}
              </dl>
              <div className="mt-4 flex items-baseline justify-between rounded-lg bg-muted px-3 py-3">
                <span className="text-sm font-medium">Total due</span>
                <span className="text-xl font-bold tabular-nums">
                  {formatMoney(v.total_amount)}
                </span>
              </div>
            </div>

            <div className="flex-1 p-5 lg:overflow-y-auto">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Version history
              </p>
              <ul className="space-y-1">
                {versions.toReversed().map((ver) => {
                  const isSelected = ver.version_number === v.version_number
                  const barWidth = Math.max(
                    6,
                    (Number(ver.total_amount) / maxTotal) * 100
                  )
                  return (
                    <li key={ver.version_number}>
                      <button
                        type="button"
                        onClick={() => setSelected(ver.version_number)}
                        aria-pressed={isSelected}
                        className={cn(
                          "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/40"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-sm">
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                isSelected && "text-primary"
                              )}
                            >
                              v{ver.version_number}
                            </span>
                            {isActive(ver) && (
                              <span className="rounded border px-1 text-[10px] text-muted-foreground">
                                Active
                              </span>
                            )}
                          </span>
                          <span className="text-sm tabular-nums">
                            {formatMoney(ver.total_amount)}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-muted-foreground/10">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              isSelected
                                ? "bg-primary"
                                : "bg-muted-foreground/30"
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDate(ver.start_date)} –{" "}
                          {formatDate(ver.end_date)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

function RevisionCard({
  version: v,
  previous,
}: {
  version: QuotationVersion
  previous?: QuotationVersion
}) {
  const days = periodDays(v.start_date, v.end_date)
  const validIn = daysUntilDate(v.valid_until)

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Fact
            icon={CalendarRange}
            label="Service period"
            value={`${formatDate(v.start_date)} – ${formatDate(v.end_date)}`}
            hint={days ? `${days} day${days === 1 ? "" : "s"}` : undefined}
          />
          <Fact
            icon={CalendarClock}
            label="Valid until"
            value={v.valid_until ? formatDate(v.valid_until) : "No expiry"}
            hint={
              validIn === null
                ? undefined
                : validIn < 0
                  ? `Expired ${Math.abs(validIn)} day${Math.abs(validIn) === 1 ? "" : "s"} ago`
                  : validIn === 0
                    ? "Expires today"
                    : `${validIn} day${validIn === 1 ? "" : "s"} left`
            }
          />
        </div>
        <span className="rounded-full border bg-background px-2.5 py-1">
          <Delta
            current={Number(v.total_amount)}
            previous={previous ? Number(previous.total_amount) : undefined}
            versionLabel={previous ? `vs v${previous.version_number}` : ""}
          />
        </span>
      </div>

      {(v.revision_reason || v.purpose) && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {v.revision_reason && (
            <Note label="Revision note" text={v.revision_reason} />
          )}
          {v.purpose && <Note label="Purpose" text={v.purpose} />}
        </div>
      )}
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
        <Icon className="size-4.5 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-base font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-2.5 rounded-lg border-l-4 border-l-border bg-muted/30 px-3 py-2">
      <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm whitespace-pre-line">{text}</p>
      </div>
    </div>
  )
}

function Delta({
  current,
  previous,
  versionLabel,
}: {
  current: number
  previous?: number
  versionLabel: string
}) {
  if (previous === undefined)
    return (
      <span className="text-[11px] text-muted-foreground">first draft</span>
    )
  const diff = current - previous
  if (diff === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
        <Minus className="h-3 w-3" /> unchanged
      </span>
    )
  const up = diff > 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        up ? "text-destructive" : "text-foreground"
      )}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {formatMoney(Math.abs(diff))} {versionLabel}
    </span>
  )
}

function TotalRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      {value !== undefined && <dd className="tabular-nums">{value}</dd>}
    </div>
  )
}
