import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  LineItemRow,
  QuotationDetailsPageHeader,
} from "@/features/quotations/components"
import { QuotationStatus } from "@/features/quotations/enums"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { QuotationVersion } from "@/features/quotations/types"
import { formatMoney } from "@/lib/format"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  FileText,
  Minus,
} from "lucide-react"
import React, { useMemo } from "react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/_admin/quotations/$quotationId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

interface DeltaProps {
  current: number
  previous?: number
  versionLabel: string
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

const statusVariant = (s: QuotationStatus) =>
  (
    ({
      draft: "outline",
      sent: "secondary",
      accepted: "default",
      expired: "outline",
    }) as Record<QuotationStatus, BadgeVariant>
  )[s] || "outline"

function Delta({ current, previous, versionLabel }: DeltaProps) {
  if (previous == null)
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
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        up ? "text-destructive" : "text-foreground"
      }`}
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

const shortDate = (d: string): string =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })

const fullDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

// ---------------------------------------------------------------------------
function RouteComponent() {
  const [activeVersion, setActiveVersion] = useState<QuotationVersion>()
  const { data: quotation } = Route.useLoaderData()

  const versions = quotation.versions

  useEffect(() => {
    setActiveVersion(quotation.activeRevision)
  }, [quotation])

  const [selected, setSelected] = useState(versions.length)
  const v = versions.find((x) => x.version_number === selected)!
  const prev = versions.find((x) => x.version_number === selected - 1)

  const combinedTaxRate = useMemo(() => {
    if (!v.tax_rates?.length) return null
    return [...new Set(v.tax_rates.map((r) => r.rate))].join("% + ") + "%"
  }, [v])

  const maxTotal = Math.max(...versions.map((x) => Number(x.total_amount)))

  return (
    <div>
      <QuotationDetailsPageHeader quotation={quotation} />
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
        {/* ================= Center: detail ================= */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Detail header */}
          <div className="shrink-0 border-b border-border bg-card px-8 py-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{quotation.number}</span>
                  <span className="text-border">·</span>
                  <span className="text-xs">
                    Client {quotation.client.number} (
                    {quotation.client?.short_name})
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {quotation.client.name}
                </h1>
                <div className="mt-1 text-xs text-muted-foreground">
                  Issued {fullDate(quotation.created_at)}
                </div>
              </div>
              <Badge
                variant={statusVariant(quotation.status)}
                className="text-[11px] tracking-wide uppercase"
              >
                {quotation.status}
              </Badge>
            </div>

            {/* Version trail */}
            <div className="mt-6">
              <div className="mb-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Revision trail — {versions.length} versions
              </div>
              <div className="flex items-center overflow-x-auto pb-1">
                {versions.toReversed().map((ver, i) => (
                  <React.Fragment key={ver.version_number}>
                    {i > 0 && (
                      <div className="w-6 shrink-0 border-t border-dashed border-border" />
                    )}
                    <button
                      onClick={() => setSelected(ver.version_number)}
                      className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full border-2 font-mono text-sm font-semibold transition-colors ${
                        ver.version_number === selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                      title={`Version ${ver.version_number}`}
                    >
                      {ver.version_number}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable detail body */}
          <div className="flex-1 overflow-y-auto py-6 pr-6">
            <Card className="mb-5">
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarRange className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {shortDate(v.start_date)} — {shortDate(v.end_date)}, 2026
                    </span>
                  </div>
                  <Delta
                    current={Number(v.total_amount)}
                    previous={Number(prev?.total_amount)}
                    versionLabel={prev ? `vs v${prev.version_number}` : ""}
                  />
                </div>
                {v.purpose ? (
                  <div className="border-l-2 border-primary py-0.5 pl-3">
                    <div className="mb-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                      Revision note
                    </div>
                    <p className="text-sm text-foreground italic">
                      "{v.purpose}"
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No revision note recorded for this version.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
                  Line items — {v.line_items.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] tracking-wide text-muted-foreground uppercase">
                      <th className="pr-3 pb-2 font-medium">#</th>
                      <th className="pr-4 pb-2 font-medium">Item</th>
                      <th className="px-3 pb-2 text-right font-medium">
                        Unit price
                      </th>
                      <th className="px-3 pb-2 text-right font-medium">Qty</th>
                      <th className="pb-2 pl-3 text-right font-medium">
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ================= Right rail: totals + ledger ================= */}
        <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-border bg-card">
          <div className="border-b border-border px-5 py-5">
            <div className="mb-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Totals · v{v.version_number}
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono text-foreground">
                  {formatMoney(v.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax {combinedTaxRate && <span>({combinedTaxRate})</span>}
                </span>
                <span className="font-mono text-foreground">
                  {formatMoney(v.tax_amount)}
                </span>
              </div>
              {Number(v.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-mono text-foreground">
                    −{formatMoney(v.discount_amount)}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total due
                </span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {formatMoney(v.total_amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Full ledger
            </div>
            <div className="space-y-0">
              {versions.map((ver) => {
                const barWidth = Math.max(
                  6,
                  (Number(ver.total_amount) / maxTotal) * 100
                )
                return (
                  <button
                    key={ver.version_number}
                    onClick={() => setSelected(ver.version_number)}
                    className={`w-full border-b border-border py-2.5 text-left last:border-0 ${
                      ver.version_number === selected
                        ? ""
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          ver.version_number === selected
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        v{ver.version_number}
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {formatMoney(ver.total_amount)}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          ver.version_number === selected
                            ? "bg-primary"
                            : "bg-muted-foreground/40"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// function RouteComponent() {
//   const { quotationId } = Route.useParams()
//   const [activeVersion, setActiveVersion] = useState<QuotationVersion>()
//   const { data: quotation } = Route.useLoaderData()
//   const back = useBackNavigation()

//   const quotationRevisions = quotation.versions

//   useEffect(() => {
//     setActiveVersion(quotation.activeRevision)
//   }, [quotation])

//   return (
//     <div className="space-y-4">
//       <PageHeader className="pb-0">
//         <PageTitle>
//           Quotation{" "}
//           <Badge variant={"outline"}>v{quotationRevisions.length}</Badge>
//         </PageTitle>
//         <PageAction className="flex gap-2">
//           <Button variant={"outline"} size={"sm"} onClick={back}>
//             Back
//           </Button>
//           <Button variant={"outline"} size={"sm"}>
//             <MailIcon />
//             Send Email
//           </Button>
//           <Button variant={"outline"} size={"sm"} asChild>
//             <Link to="/quotations/$quotationId/pdf" params={{ quotationId }}>
//               <IconFileTypePdf />
//               PDF
//             </Link>
//           </Button>
//         </PageAction>
//       </PageHeader>
//       <Card>
//         <CardHeader>
//           <CardTitle>
//             {quotation?.number} <Badge>{quotation?.status}</Badge>
//           </CardTitle>
//           <CardDescription>
//             {/* <Badge>{quotation?.status}</Badge> */}
//           </CardDescription>
//           <CardAction>
//             {quotation.status != "accepted" && (
//               <Button asChild>
//                 <Link
//                   to="/quotations/$quotationId/edit"
//                   params={{ quotationId }}
//                 >
//                   <PlusIcon />
//                   New Revision
//                 </Link>
//               </Button>
//             )}
//           </CardAction>
//         </CardHeader>
//       </Card>
//       <div className="grid gap-5 md:grid-cols-5">
//         <div className="md:col-span-2">
//           {quotationRevisions.map((ver) => (
//             <div
//               key={ver.version_number}
//               className={cn(
//                 "space-y-2 rounded-lg border border-dashed p-4",
//                 ver.version_number === activeVersion?.version_number &&
//                   "bg-card"
//               )}
//               onClick={() => setActiveVersion(ver)}
//             >
//               <div>Version: {ver.version_number}</div>
//               <div>Date: {ver.start_date}</div>
//               <div>Amount: {formatMoney(ver.total_amount)}</div>
//               <div>Service Count: {ver.line_items.length}</div>
//             </div>
//           ))}
//         </div>
//         <div className="md:col-span-3">
//           {activeVersion && (
//             <div>
//               {activeVersion.line_items.map((lineitem) => (
//                 <div
//                   key={lineitem.unit_price}
//                   className="rounded-lg border border-dashed p-4"
//                 >
//                   {lineitem.source === "distance" && (
//                     <DistanceLineItemListItem lineItem={lineitem} />
//                   )}
//                   {lineitem.source === "route" && (
//                     <RouteLineItemListItem lineItem={lineitem} />
//                   )}
//                   {lineitem.source === "service" && (
//                     <ServiceLineItemListItem lineItem={lineitem} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//           <div className="grid md:grid-cols-2">
//             <div className="col-span-1"></div>
//             <div className="col-span-1 mt-2 space-y-2">
//               <div className="flex justify-between">
//                 <div>Subtotal</div>
//                 <div>{formatMoney(activeVersion?.subtotal)}</div>
//               </div>
//               <div className="flex justify-between">
//                 <div>Tax</div>
//                 <div>{formatMoney(activeVersion?.tax_amount)}</div>
//               </div>
//               <div className="flex justify-between">
//                 <div>Total</div>
//                 <div className="font-semibold">
//                   {formatMoney(activeVersion?.total_amount)}
//                 </div>
//               </div>
//               <Separator />
//               <Separator />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
