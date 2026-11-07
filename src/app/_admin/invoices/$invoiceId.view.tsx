import React, { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import Decimal from "decimal.js"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  PiggyBank,
  Receipt,
  UserRound,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import type { Invoice } from "@/features/invoices/types"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { PageBackButton } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InvoiceStatusIndicator } from "@/features/invoices/components"
import { useSendInvoiceEmail } from "@/features/invoices/hooks/use-invoice-actions"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { getInvoicePdfFn } from "@/features/invoices/services"
import { EnterPaymentModal } from "@/features/payments/components"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { daysUntil, formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_admin/invoices/$invoiceId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("invoices:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      invoiceDetailsQueryOptions(params.invoiceId)
    ),
})

const SETTLED_STATUSES = ["paid", "refunded", "cancelled", "void"]

const toDecimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

function RouteComponent() {
  const { invoiceId } = Route.useParams()
  const { data } = useSuspenseQuery(invoiceDetailsQueryOptions(invoiceId))
  const invoice = data.data

  const total = toDecimal(invoice.total)
  const paid = toDecimal(invoice.amount_paid)
  const balance = toDecimal(invoice.balance_due)
  const paidPercent = total.gt(0)
    ? Math.min(100, paid.div(total).times(100).toNumber())
    : 0
  const isSettled = SETTLED_STATUSES.includes(invoice.status) || balance.lte(0)

  return (
    <div className="space-y-6">
      <InvoiceHero
        invoice={invoice}
        paidPercent={paidPercent}
        isSettled={isSettled}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineItemsCard invoice={invoice} />
        </div>

        <div className="space-y-6">
          <BillToCard invoice={invoice} />
          <RecordCard invoice={invoice} />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Hero                                    */
/* -------------------------------------------------------------------------- */

function InvoiceHero({
  invoice,
  paidPercent,
  isSettled,
}: {
  invoice: Invoice
  paidPercent: number
  isSettled: boolean
}) {
  const days = daysUntil(invoice.due_date)
  const isOverdue = !isSettled && days < 0

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="-ml-2 pt-1">
            <PageBackButton />
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-7" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {invoice.number}
              </h1>
              <InvoiceStatusIndicator status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Issued {formatDate(invoice.created_at)} · Due{" "}
              {formatDate(invoice.due_date)}
            </p>
            <Link
              to="/clients/$clientId/view"
              params={{ clientId: invoice.client.id }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <UserRound className="size-3.5" />
              <span className="truncate capitalize">{invoice.client.name}</span>
            </Link>
          </div>
        </div>

        <InvoiceActions invoice={invoice} />
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 divide-x divide-y border-t bg-muted/30 md:grid-cols-4 md:divide-y-0">
        <Stat
          icon={Wallet}
          label="Invoice total"
          value={formatMoney(invoice.total)}
          hint={`${invoice.line_items.length} line item${invoice.line_items.length === 1 ? "" : "s"}`}
        />
        <Stat
          icon={PiggyBank}
          label="Amount paid"
          value={formatMoney(invoice.amount_paid ?? 0)}
          hint={`${Math.round(paidPercent)}% of total`}
        />
        <Stat
          icon={isSettled ? CheckCircle2 : AlertCircle}
          label="Balance due"
          value={formatMoney(invoice.balance_due)}
          tone={isSettled ? "success" : isOverdue ? "error" : "warning"}
          hint={isSettled ? "Nothing outstanding" : "Outstanding"}
        />
        <Stat
          icon={CalendarClock}
          label="Due date"
          value={formatDate(invoice.due_date)}
          tone={isOverdue ? "error" : undefined}
          hint={dueHint(days, isSettled)}
        />
      </div>

      {/* Payment progress */}
      <div className="flex items-center gap-3 border-t px-5 py-3">
        <Progress
          value={paidPercent}
          className={cn(
            "h-2",
            isSettled && "[&_[data-slot=progress-indicator]]:bg-emerald-500"
          )}
          aria-label="Payment progress"
        />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {Math.round(paidPercent)}% paid
        </span>
      </div>
    </Card>
  )
}

function dueHint(days: number, isSettled: boolean) {
  if (isSettled) return "Settled"
  if (days === 0) return "Due today"
  if (days > 0) return `In ${days} day${days === 1 ? "" : "s"}`
  const overdue = Math.abs(days)
  return `${overdue} day${overdue === 1 ? "" : "s"} overdue`
}

function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const tr = useTranslation()
  const [openPayment, setOpenPayment] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { sendInvoiceEmail, isPending: isSending } = useSendInvoiceEmail()

  async function downloadPdf() {
    setIsDownloading(true)
    try {
      const response = await getInvoicePdfFn({ data: { id: invoice.id } })
      const blob = await response.blob()
      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      )
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${invoice.number}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Could not download the invoice PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {invoice.is_payable && (
        <Can permission={"payments:create"}>
          <Button onClick={() => setOpenPayment(true)}>
            <ActionIcon action="create" />
            {tr("payments.form.enterPayment")}
          </Button>
          <EnterPaymentModal
            open={openPayment}
            onOpenChange={() => setOpenPayment(false)}
            initialData={{ type: "invoice", entityId: invoice.id }}
          />
        </Can>
      )}
      <Button variant="outline" asChild>
        <Link to="/invoices/$invoiceId/pdf" params={{ invoiceId: invoice.id }}>
          <ActionIcon action="view-pdf" />
          View PDF
        </Link>
      </Button>
      <Button variant="outline" onClick={downloadPdf} disabled={isDownloading}>
        {isDownloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        Download
      </Button>
      <Button
        variant="outline"
        onClick={() => sendInvoiceEmail(invoice.id)}
        disabled={isSending}
      >
        {isSending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ActionIcon action="email" />
        )}
        Send email
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Line items                                 */
/* -------------------------------------------------------------------------- */

function LineItemsCard({ invoice }: { invoice: Invoice }) {
  const fuelTotal = invoice.line_items.reduce(
    (sum, item) => sum.plus(toDecimal(item.fuel_surcharge)),
    new Decimal(0)
  )
  const discount = toDecimal(invoice.discount)
  const loading = toDecimal(invoice.loading_charge)
  const offloading = toDecimal(invoice.offloading_charge)

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4 text-muted-foreground" />
          Line items
        </CardTitle>
      </CardHeader>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-10 pl-5">#</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Days</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Fuel</TableHead>
            <TableHead className="pr-5 text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.line_items.map((item, index) => (
            <TableRow key={index} className="align-top">
              <TableCell className="pl-5 text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell className="max-w-xs whitespace-pre-line">
                {item.description}
                {(toDecimal(item.loading_charge).gt(0) ||
                  toDecimal(item.offloading_charge).gt(0)) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Loading {formatMoney(item.loading_charge ?? 0)} · Offloading{" "}
                    {formatMoney(item.offloading_charge ?? 0)}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.service_days}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.quantity}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(item.unit_price)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {toDecimal(item.fuel_surcharge).gt(0)
                  ? formatMoney(item.fuel_surcharge)
                  : "—"}
              </TableCell>
              <TableCell className="pr-5 text-right font-medium tabular-nums">
                {formatMoney(item.line_total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totals */}
      <div className="flex justify-end border-t bg-muted/20 p-5">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <SummaryRow
            label="Subtotal"
            value={formatMoney(invoice.subtotal ?? 0)}
          />
          {fuelTotal.gt(0) && (
            <SummaryRow
              label="Fuel charges"
              value={formatMoney(fuelTotal.toString())}
            />
          )}
          {loading.gt(0) && (
            <SummaryRow
              label="Loading fees"
              value={formatMoney(invoice.loading_charge)}
            />
          )}
          {offloading.gt(0) && (
            <SummaryRow
              label="Offloading fees"
              value={formatMoney(invoice.offloading_charge)}
            />
          )}
          {discount.gt(0) && (
            <SummaryRow
              label="Discount"
              value={`− ${formatMoney(invoice.discount)}`}
              className="text-emerald-700 dark:text-emerald-400"
            />
          )}
          <SummaryRow
            label="Tax"
            value={formatMoney(invoice.tax_amount ?? 0)}
          />
          <div className="border-t pt-2">
            <SummaryRow
              label="Total"
              value={formatMoney(invoice.total)}
              className="text-base font-semibold"
            />
          </div>
          <SummaryRow
            label="Amount paid"
            value={`− ${formatMoney(invoice.amount_paid ?? 0)}`}
            muted
          />
          <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
            <dt className="font-medium text-primary">Balance due</dt>
            <dd className="text-lg font-bold text-primary tabular-nums">
              {formatMoney(invoice.balance_due)}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Side cards                                */
/* -------------------------------------------------------------------------- */

function BillToCard({ invoice }: { invoice: Invoice }) {
  const { client } = invoice
  return (
    <Card>
      <CardHeader>
        <CardDescription>Bill to</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          to="/clients/$clientId/view"
          params={{ clientId: client.id }}
          className="group -m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary uppercase">
            {client.short_name ?? client.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium capitalize group-hover:underline">
              {client.name}
            </p>
            <p className="text-sm text-muted-foreground">{client.number}</p>
          </div>
        </Link>
        {invoice.purpose && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-muted-foreground">Purpose</p>
            <p className="mt-1 text-sm whitespace-pre-line">
              {invoice.purpose}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecordCard({ invoice }: { invoice: Invoice }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Record</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2.5 text-sm">
          <SummaryRow label="Invoice no." value={invoice.number} />
          <SummaryRow label="Issued" value={formatDate(invoice.created_at)} />
          <SummaryRow label="Due" value={formatDate(invoice.due_date)} />
          <SummaryRow
            label="Invoice ID"
            value={
              <span className="font-mono text-xs" title={invoice.id}>
                {invoice.id.slice(0, 8)}
              </span>
            }
          />
        </dl>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Primitives                                */
/* -------------------------------------------------------------------------- */

type IconType = React.ComponentType<{ className?: string }>

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: IconType
  label: string
  value: React.ReactNode
  hint?: string
  tone?: "warning" | "success" | "error"
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0 text-muted-foreground",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "error" && "text-destructive"
        )}
      />
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "truncate text-xl font-semibold tabular-nums",
            tone === "warning" && "text-amber-700 dark:text-amber-400",
            tone === "success" && "text-emerald-700 dark:text-emerald-400",
            tone === "error" && "text-destructive"
          )}
        >
          {value}
        </p>
        {hint && (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  muted = false,
  className,
}: {
  label: string
  value: React.ReactNode
  muted?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        muted && "text-muted-foreground",
        className
      )}
    >
      <dt className={cn(!className && "text-muted-foreground")}>{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  )
}
