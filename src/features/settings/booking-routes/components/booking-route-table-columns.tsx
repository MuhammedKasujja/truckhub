import { ColumnDef } from "@tanstack/react-table"
import { BookingRoute } from "../schemas"
import { formatNumber } from "@/lib/format"
import { BookingRouteTableRowAction } from "../types"
import { TFunction } from "@/i18n"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"

type RowActionState = BookingRouteTableRowAction | null
type SetRowAction = React.Dispatch<
  React.SetStateAction<BookingRouteTableRowAction | null>
>

interface GetBookingRouteTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<BookingRouteTableRowAction | null>
  >
  tr: TFunction
}

export function getBookingRoutesColumns({
  setRowAction,
}: GetBookingRouteTableColumnsProps): ColumnDef<BookingRoute>[] {
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
            {formatNumber(row.original.min_hrs)} -{" "}
            {formatNumber(row.original.max_hrs)} hrs
          </p>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Can permission="config:routes:edit">
            <Button
              type="button"
              size={"icon-sm"}
              onClick={() => setRowAction({ variant: "update", row: row })}
            >
              <EditIcon />
            </Button>
          </Can>
        )
      },
    },
  ]
}
