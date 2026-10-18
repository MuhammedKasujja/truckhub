import { Button } from "@/components/ui/button"
import { Payment } from "@/features/payments/types"
import { formatDate, formatMoney } from "@/lib/format"
import { ColumnDef } from "@tanstack/react-table"
import { PaymentStatuses, PaymentModeList } from "@/config/constants"
import { Badge } from "@/components/ui/badge"
import { TFunction } from "@/i18n"
import { PaymentStatusIndicator } from "./payment-status-indicator"
import { PaymentTableActions } from "./payment-table-actions"

export function getPaymentTableColumns(tr: TFunction): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "number",
      header: tr("payments.number"),
      cell: ({ row }) => {
        return <Button variant={"link"}>{row.original.number}</Button>
      },
      size: 100,
      meta: {
        label: tr("payments.number"),
      },
    },
    {
      accessorKey: "amount",
      header: tr("payments.amount"),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 font-semibold">
            {formatMoney(row.original.amount)}
          </div>
        )
      },
      meta: {
        label: tr("payments.amount"),
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: tr("payments.status"),
      cell: ({ row }) => {
        const status = row.original.status
        return <PaymentStatusIndicator status={status} />
      },
      meta: {
        label: tr("payments.status"),
        variant: "multiSelect",
        options: PaymentStatuses.map((status) => ({
          label: tr(`payments.statuses.${status}`),
          value: `${status}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      id: "method",
      accessorKey: "method",
      header: tr("payments.method"),
      cell: ({ row }) => {
        const method = row.original.method
        return (
          <Badge variant="outline">{tr(`payments.methods.${method}`)}</Badge>
        )
      },
      meta: {
        label: tr("payments.method"),
        variant: "multiSelect",
        options: PaymentModeList.map((method) => ({
          label: tr(`payments.methods.${method}`),
          value: `${method}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      id: "customer",
      header: tr("client"),
      cell: ({ row }) => {
        return <p>{row.original.client.fullname}</p>
      },
    },
    {
      id: "date",
      accessorKey: "date",
      header: tr("payments.date"),
      cell: ({ row }) => {
        return <p>{formatDate(row.original.paid_at)}</p>
      },
      meta: {
        label: tr("payments.date"),
        variant: "dateRange",
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const pay = row.original
        return <PaymentTableActions key={pay.id} payment={pay} />
      },
      size: 100,
    },
  ]
}
