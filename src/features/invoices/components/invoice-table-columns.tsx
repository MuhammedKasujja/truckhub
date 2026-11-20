import { Link } from "@tanstack/react-router"
import { InvoiceStatusIndicator } from "./invoice-status-indicator"
import { InvoiceTableActions } from "./invoice-table-actions"
import type { ColumnDef } from "@tanstack/react-table"
import type { Invoice } from "../types"
import type { TFunction } from "@/i18n"
import type { SetInvoiceTableAction } from "./invoice-table-actions"
import { formatDate, formatMoney, formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  tr: TFunction
  setRowAction: SetInvoiceTableAction
}

const DAY_MS = 86_400_000

/** Whole calendar days from today until the date; negative once it has passed. */
function daysUntil(date: string) {
  const startOfDay = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round(
    (startOfDay(new Date(date)) - startOfDay(new Date())) / DAY_MS
  )
}

const days = (count: number) =>
  formatPlural(count, { singular: "day", plural: "days" })

/** Due date, with how close or late it is while the invoice can still be paid. */
function DueDateCell({ invoice }: { invoice: Invoice }) {
  const remaining = daysUntil(invoice.due_date)
  const isOverdue =
    invoice.status === "over_due" || (invoice.is_payable && remaining < 0)

  let hint: string | null = null
  if (invoice.is_payable && !Number.isNaN(remaining)) {
    if (remaining < 0) hint = `${days(-remaining)} overdue`
    else if (remaining === 0) hint = "Due today"
    else if (remaining <= 7) hint = `Due in ${days(remaining)}`
  }

  return (
    <div className="whitespace-nowrap">
      <p className={cn(isOverdue && "font-medium text-destructive")}>
        {formatDate(invoice.due_date)}
      </p>
      {hint && (
        <p
          className={cn(
            "text-xs",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

/** What is still owed, with the amount already paid on part-paid invoices. */
function BalanceCell({ invoice }: { invoice: Invoice }) {
  const balance = Number(invoice.balance_due)
  const paid = Number(invoice.amount_paid ?? 0)

  if (!balance) {
    return <p className="text-right text-muted-foreground">—</p>
  }

  return (
    <div className="text-right whitespace-nowrap tabular-nums">
      <p className="font-medium">{formatMoney(invoice.balance_due)}</p>
      {paid > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatMoney(invoice.amount_paid)} paid
        </p>
      )}
    </div>
  )
}

export function getInvoiceTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Invoice>[] {
  const header =
    (label: string, align: "left" | "right" = "left") =>
    () => (
      <p
        className={cn(
          "text-xs font-medium tracking-wide text-muted-foreground uppercase",
          align === "right" && "text-right"
        )}
      >
        {label}
      </p>
    )

  return [
    {
      accessorKey: "number",
      header: header(tr("invoices.invoiceNumber")),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <Link
            to="/invoices/$invoiceId/view"
            params={{ invoiceId: row.original.id }}
            className="font-medium text-primary hover:underline"
          >
            {row.original.number}
          </Link>
          <p className="text-xs text-muted-foreground">
            {tr("common.created")} {formatDate(row.original.created_at)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: header(tr("common.client")),
      cell: ({ row }) => (
        <p className="max-w-64 truncate" title={row.original.client.name}>
          {row.original.client.name}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: header(tr("common.status")),
      cell: ({ row }) => <InvoiceStatusIndicator status={row.original.status} />,
    },
    {
      accessorKey: "due_date",
      header: header(tr("common.dueDate")),
      cell: ({ row }) => <DueDateCell invoice={row.original} />,
    },
    {
      accessorKey: "total",
      header: header(tr("common.form.amount"), "right"),
      cell: ({ row }) => (
        <p className="text-right whitespace-nowrap tabular-nums">
          {formatMoney(row.original.total)}
        </p>
      ),
    },
    {
      accessorKey: "balance_due",
      header: header(tr("common.form.balance"), "right"),
      cell: ({ row }) => <BalanceCell invoice={row.original} />,
    },
    {
      id: "actions",
      size: 40,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <InvoiceTableActions
            invoiceRow={{ row }}
            setRowAction={setRowAction}
          />
        </div>
      ),
    },
  ]
}
