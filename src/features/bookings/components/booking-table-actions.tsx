import { Button } from "@/components/ui/button"
import { EditIcon, EyeIcon, MoreVertical, SendIcon, Stars } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookingTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"

export type SetBookingTableAction = React.Dispatch<
  React.SetStateAction<BookingTableRowAction | null>
>
type Row = Pick<BookingTableRowAction, "row">

interface TableActionsProps {
  tableRow: Row
  setRowAction: SetBookingTableAction
}

export function BookingTableActions({
  tableRow,
  setRowAction,
}: TableActionsProps) {
  const booking = tableRow.row.original
  const {createInvoice} = useCreateInvoice()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon-sm"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Can permission={"bookings:edit"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/bookings/$bookingId/view"}
                params={{ bookingId: booking.id }}
              >
                <EditIcon />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"bookings:view"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/bookings/$bookingId/view"}
                params={{ bookingId: booking.id }}
              >
                <EyeIcon />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"bookings:start"}>
            {isNotInEnum(booking.status, ["started"]) && (
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({ row: tableRow.row, variant: "start" })
                }
              >
                <Stars />
                Start
              </DropdownMenuItem>
            )}
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"bookings:start"}>
            {isNotInEnum(booking.status, ["completed"]) && (
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({ row: tableRow.row, variant: "markCompleted" })
                }
              >
                <Stars />
                Mark Completed
              </DropdownMenuItem>
            )}
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"payments:create"}>
            {isNotInEnum(booking.status, ["invoiced"]) && (
              <DropdownMenuItem
                onClick={() =>
                  createInvoice({booking_id: booking.id, due_date: "2026-07-27"})
                  // setRowAction({ row: tableRow.row, variant: "invoice" })
                }
              >
                <SendIcon />
                Invoice
              </DropdownMenuItem>
            )}
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
