import { Button } from "@/components/ui/button"
import { formatDateTime, formatMoney } from "@/lib/format"
import { Booking, BookingStatusList } from "@/features/bookings/types"
import { ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { TFunction } from "@/i18n"
import {
  BookingTableActions,
  SetBookingTableAction,
} from "./booking-table-actions"

export function getBookingTableColumns(
  tr: TFunction,
  setRowAction: SetBookingTableAction
): ColumnDef<Booking>[] {
  return [
    {
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <BookingTableActions tableRow={{ row }} setRowAction={setRowAction} />
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={"/bookings/$bookingId/view"}
              params={{ bookingId: row.original.id }}
            >
              {row.original.number}
            </Link>
          </Button>
        )
      },
      size: 80,
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={tr("client")} />
      ),
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={`/clients/$clientId/view`}
              params={{ clientId: row.original.client.id }}
            >
              {row.original.client.fullname}
            </Link>
          </Button>
        )
      },
      enableHiding: false,
    },
    {
      id: "services",
      header: tr("services"),
      cell: ({ row }) => {
        return <p className="text-center">{row.original.line_items.length}</p>
      },
      size: 80,
    },
    {
      id: "status",
      accessorKey: "status",
      header: tr("status"),
      cell: ({ row }) => {
        return <Badge variant={"outline"}>{row.original.status}</Badge>
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: BookingStatusList.map((status) => ({
          label: `${status}`,
          value: `${status}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "pickup_time",
      header: "Pickup Date",
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.estimated_pickup_time)}</p>
      },
    },
    {
      accessorKey: "amount",
      header: tr("amount"),
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.amount)}</p>
      },
    },
    {
      accessorKey: "balance",
      header: tr("balance"),
      cell: ({ row }) => {
        return <p>{formatMoney(row.original.balance)}</p>
      },
    },
  ]
}
