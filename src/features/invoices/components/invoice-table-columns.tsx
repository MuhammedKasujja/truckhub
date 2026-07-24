import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "../types"
import { TFunction } from "@/i18n"
import { formatDate, formatMoney } from "@/lib/format"

type Props = {
  tr: TFunction
}

export function getInvoiceTableColumns({ tr }: Props): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: "number",
      header: () => <p className="uppercase">{tr("invoice_number")}</p>,
      cell: ({ row }) => {
        return <p>{row.original.number}</p>
      },
    },
    {
      accessorKey: "client",
      header: () => <p className="uppercase">{tr("client")}</p>,
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
      accessorKey: "status",
      header: () => <p className="uppercase">{tr("status")}</p>,
      cell: ({ row }) => {
        return <p>{row.original.status}</p>
      },
    },
    {
      accessorKey: "due_date",
      header: () => <p className="uppercase">Due Date</p>,
      cell: ({ row }) => {
        return <p>{formatDate(row.original.due_date)}</p>
      },
    },
    {
      accessorKey: "created_at",
      header: () => <p className="uppercase">Created</p>,
      cell: ({ row }) => {
        return <p>{formatDate(row.original.created_at)}</p>
      },
    },
  ]
}
