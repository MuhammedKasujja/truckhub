import { Button } from "@/components/ui/button"
import { EditIcon, EyeIcon, MoreVertical } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookingTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

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
          {/* <Can permission={"payments:create"}>
            {isNotInEnum(booking.status, ["paid"]) && (
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({ row: tableRow.row, variant: "makePayment" })
                }
              >
                <CreditCard />
                Payment
              </DropdownMenuItem>
            )}
          </Can> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
