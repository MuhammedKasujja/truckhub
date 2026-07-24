import { ColumnDef } from "@tanstack/react-table"
import { Quotation } from "../types"
import { TFunction } from "@/i18n"
import { formatDate, formatMoney } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"
import { QuotationTableActions } from "./quotation-table-actions"

type Props = {
  tr: TFunction
}

export function getQuotationTableColumns({
  tr,
}: Props): ColumnDef<Quotation>[] {
  return [
    {
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => <QuotationTableActions quotation={row.original} />,
    },
    {
      accessorKey: "number",
      header: tr("quotation_number"),
      cell: ({ row }) => {
        return (
          <Link
            to="/quotations/$quotationId/view"
            params={{ quotationId: row.original.id }}
          >
            {row.original.number}
          </Link>
        )
      },
    },
    {
      accessorKey: "client",
      header: tr("client"),
      cell: ({ row }) => {
        return (
          <Link
            to="/clients/$clientId/view"
            params={{ clientId: row.original.client.id }}
          >
            {row.original.client.name}
          </Link>
        )
      },
    },
    {
      accessorKey: "amount",
      header: tr("common.form.amount"),
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.amount)}</p>
      },
    },
    {
      accessorKey: "status",
      header: tr("status"),
      cell: ({ row }) => {
        return <Badge variant={"outline"}>{row.original.status}</Badge>
      },
    },
    {
      id: "revesions",
      header: "Revisions",
      cell: ({ row }) => {
        return <p>{row.original.versions.length}</p>
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
