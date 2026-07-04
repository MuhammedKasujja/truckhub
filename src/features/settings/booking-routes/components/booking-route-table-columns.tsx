import { ColumnDef } from "@tanstack/react-table"
import { BookingRoute } from "../schemas"
import { formatNumber } from "@/lib/format"

export function getBookingRoutesColumns(): ColumnDef<BookingRoute>[] {
  return [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => {
        return <p>{row.original.id}</p>
      },
    },
    {
      accessorKey: "origin",
      header: "Origin",
      cell: ({ row }) => {
        return <p>{row.original.origin}</p>
      },
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => {
        return <p>{row.original.destination}</p>
      },
    },
    {
      accessorKey: "distance_km",
      header: "Distance (km)",
      cell: ({ row }) => {
        return <p>{formatNumber(row.original.distance_km)}</p>
      },
    },
    {
      id: "time_period",
      header: "Time Period",
      cell: ({ row }) => {
        return (
          <p>
            {formatNumber(row.original.min_hrs)} - {formatNumber(row.original.max_hrs)} hrs
          </p>
        )
      },
    },
  ]
}
