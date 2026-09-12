import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "../types"
import { TFunction } from "@/i18n"
import { formatDate, formatMoney } from "@/lib/format"
import {
  InvoiceTableActions,
  SetInvoiceTableAction,
} from "./invoice-table-actions"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"

type Props = {
  tr: TFunction
  setRowAction: SetInvoiceTableAction
}

export function getInvoiceTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Invoice>[] {
  return [
    {
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <InvoiceTableActions invoiceRow={{ row }} setRowAction={setRowAction} />
      ),
    },
    {
      accessorKey: "number",
      header: () => <p className="uppercase">{tr("invoices.invoiceNumber")}</p>,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <Button type="button" variant={"link"} asChild>
            <Link
              to="/invoices/$invoiceId/view"
              params={{ invoiceId: invoice.id }}
            >
              {invoice.number}
            </Link>
          </Button>
        )
      },
    },
    {
      accessorKey: "client",
      header: () => <p className="uppercase">{tr("common.client")}</p>,
      cell: ({ row }) => {
        return <p>{row.original.client.name}</p>
      },
    },
    {
      accessorKey: "total",
      header: () => <p className="uppercase">{tr("common.form.amount")}</p>,
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.total)}</p>
      },
    },
    {
      accessorKey: "balance_due",
      header: () => <p className="uppercase">{tr("common.form.balance")}</p>,
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.balance_due)}</p>
      },
    },
    {
      accessorKey: "status",
      header: () => <p className="uppercase">{tr("common.status")}</p>,
      cell: ({ row }) => {
        return <p>{row.original.status}</p>
      },
    },
    {
      accessorKey: "due_date",
      header: () => <p className="uppercase">{tr("common.dueDate")}</p>,
      cell: ({ row }) => {
        return (
          <p>{formatDate(row.original.due_date, { timeStyle: undefined })}</p>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: () => <p className="uppercase">{tr("common.created")}</p>,
      cell: ({ row }) => {
        return <p>{formatDate(row.original.created_at)}</p>
      },
    },
  ]
}
