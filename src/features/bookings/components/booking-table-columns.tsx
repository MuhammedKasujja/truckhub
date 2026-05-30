"use client"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatPrice } from "@/lib/format"
import { Booking } from "@/features/bookings/types"
import { ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { EditIcon, EyeIcon } from "lucide-react"
import { EditPaymentModal } from "@/features/payments/components/edit-payment-modal"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export function getBookingTableColumns(): ColumnDef<Booking>[] {
  return [
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
        <DataTableColumnHeader column={column} label="Customer" />
      ),
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={`/clients/$clientId/view`}
              params={{ clientId: row.original.customer.id }}
            >
              {row.original.customer.fullname}
            </Link>
          </Button>
        )
      },
      enableHiding: false,
    },
    {
      id: "services",
      header: "Services",
      cell: ({ row }) => {
        return <p className="text-center">{row.original.services.length}</p>
      },
      size: 80,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <Badge variant={"outline"}>{row.original.status}</Badge>
      },
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
      header: "Amount",
      cell: ({ row }) => {
        return <p>{formatPrice(row.original.amount)}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex gap-2">
            {booking.status !== "completed" && (
              <Can permission={"bookings:view"}>
                <Button variant={"outline"} size={"icon"} asChild>
                  <Link
                    to={"/bookings/$bookingId/view"}
                    params={{ bookingId: row.original.id }}
                  >
                    <EyeIcon />
                  </Link>
                </Button>
              </Can>
            )}
            <Can permission={"bookings:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link
                  to={"/bookings/$bookingId/edit"}
                  params={{ bookingId: row.original.id }}
                >
                  <EditIcon />
                </Link>
              </Button>
            </Can>
            {booking.balance > 0 && (
              <Can permission={"payments:create"}>
                <EditPaymentModal
                  initialData={{
                    entity_id: booking.id,
                    type: "booking",
                    amount: booking.balance,
                  }}
                />
              </Can>
            )}
          </div>
        )
      },
    },
  ]
}
