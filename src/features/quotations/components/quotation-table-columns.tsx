import { ColumnDef } from "@tanstack/react-table"
import { Quotation } from "../types"
import { TFunction } from "@/i18n"
import { formatDate, formatMoney } from "@/lib/format"

type Props = {
  tr: TFunction
}

export function getQuotationTableColumns({ tr }: Props): ColumnDef<Quotation>[] {
  return [
    {
      accessorKey: "amount",
      header: tr("common.form.amount"),
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.amount)}</p>
      },
    },
    {
      accessorKey: "amount",
      header: tr("invoice_number"),
      cell: ({ row }) => {
        return <p>{row.original.number}</p>
      },
    },
    {
      accessorKey: "client",
      header: tr("client"),
      cell: ({ row }) => {
        return <p>{row.original.client.name}</p>
      },
    },
    {
      accessorKey: "last_updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        return <p>{formatDate(row.original.last_updated_at)}</p>
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return <p>{formatDate(row.original.created_at)}</p>
      },
    },
  ]
}
