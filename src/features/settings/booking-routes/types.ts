import { BookingRoute } from "./schemas"
import { DataTableRowAction } from "@/types/data-table"

export interface BookingRouteTableRowAction extends DataTableRowAction<
  BookingRoute,
  "update" | "delete" | "create"
> {}

export type BookingRouteRowActionState = BookingRouteTableRowAction | null
export type SetBookingRouteRowAction = React.Dispatch<
  React.SetStateAction<BookingRouteTableRowAction | null>
>
