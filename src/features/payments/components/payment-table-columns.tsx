import { Button } from "@/components/ui/button"
import { Payment, PaymentTableRowAction } from "@/features/payments/types"
import { formatDateTime, formatMoney } from "@/lib/format"
import { ColumnDef } from "@tanstack/react-table"
import { PaymentStatuses, PaymentModeList } from "@/config/constants"
import { Badge } from "@/components/ui/badge"
import { TFunction } from "@/i18n"
import { PaymentStatusIndicator } from "./payment-status-indicator"
import { Link } from "@tanstack/react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"

type Props = {
  tr: TFunction
  setRowAction: React.Dispatch<
    React.SetStateAction<PaymentTableRowAction | null>
  >
}

export function getPaymentTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Payment>[] {
  return [
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={"icon-sm"}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setRowAction({ row: row, variant: "view" })}
                >
                  <ActionIcon action="view" />
                  View
                </DropdownMenuItem>
                <Can permission="payments:reverse">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setRowAction({ row: row, variant: "reverse" })
                    }
                  >
                    <ActionIcon action="reverse" />
                    Reverse
                  </DropdownMenuItem>
                </Can>
                <Can permission="payments:delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      setRowAction({ row: row, variant: "delete" })
                    }
                  >
                    <ActionIcon action="delete" />
                    Delete
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
    {
      accessorKey: "number",
      header: tr("payments.number"),
      cell: ({ row }) => {
        return (
          <Button
            variant={"link"}
            onClick={() => setRowAction({ row: row, variant: "view" })}
          >
            {row.original.number}
          </Button>
        )
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
        const client = row.original.client
        return (
          <div className="flex flex-col gap-0.5">
            <Link to="/clients/$clientId/view" params={{ clientId: client.id }}>
              {client.fullname}
            </Link>
          </div>
        )
      },
    },
    {
      id: "date",
      accessorKey: "date",
      header: tr("payments.paidDate"),
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.paid_at)}</p>
      },
      meta: {
        label: tr("payments.paidDate"),
        variant: "dateRange",
      },
      enableColumnFilter: true,
    },
  ]
}
