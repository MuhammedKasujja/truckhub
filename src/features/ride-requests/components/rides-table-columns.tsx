"use client"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatMoney } from "@/lib/format"
import { RideRequest, RideStatusList } from "@/features/ride-requests/types"
import { ColumnDef } from "@tanstack/react-table"
import { Status } from "@/components/ui/status"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { EditIcon, EyeIcon } from "lucide-react"
import { TFunction } from "@/i18n"

export function getRideRequestTableColumns(tr: TFunction): ColumnDef<RideRequest>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={`/rides/$rideId/view`}
              params={{ rideId: row.original.id }}
            >
              {row.original.number}
            </Link>
          </Button>
        )
      },
      size: 100,
    },
    {
      accessorKey: "origin",
      header: "Origin",
      cell: ({ row }) => {
        return <p className="max-w-92 truncate">{row.original.origin}</p>
      },
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => {
        return <p className="max-w-92 truncate">{row.original.destination}</p>
      },
      size: 120,
    },
    {
      accessorKey: "customer",
      header: "Customer",
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
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <Status>{tr(`rides.statues.${row.original.status}`)}</Status>
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: RideStatusList.map((status) => ({
          label: `${status}`,
          value: `${status}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return <div>{formatMoney(row.original.amount)}</div>
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.request_start_time)}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ride = row.original
        return (
          <div className="flex gap-2">
            {ride.status !== "completed" && (
              <Can permission={"rides:view"}>
                <Button variant={"outline"} size={"icon"} asChild>
                  <Link to={`/rides/$rideId/view`} params={{ rideId: ride.id }}>
                    <EyeIcon />
                  </Link>
                </Button>
              </Can>
            )}
            <Can permission={"rides:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link to={"/rides/$rideId/edit"} params={{ rideId: ride.id }}>
                  <EditIcon />
                </Link>
              </Button>
            </Can>
          </div>
        )
      },
      size: 120,
    },
  ]
}
