import { ColumnDef } from "@tanstack/react-table"
import { BookingRoute } from "../schemas"

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
        return <p>{row.original.distance_km}</p>
      },
    },
    {
      id: "time_period",
      header: "Time Period",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.min_hrs}-{row.original.max_hrs}HRS
          </p>
        )
      },
    },
  ]
}
