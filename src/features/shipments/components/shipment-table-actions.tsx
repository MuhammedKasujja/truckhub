import { Button } from "@/components/ui/button"
import { EyeIcon, MoreVertical } from "lucide-react"
import { Can } from "@/components/has-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShipmentTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

export type SetShipmentTableAction = React.Dispatch<
  React.SetStateAction<ShipmentTableRowAction | null>
>
type Row = Pick<ShipmentTableRowAction, "row">

interface TableActionsProps {
  shipmentRow: Row
  setRowAction: React.Dispatch<
    React.SetStateAction<ShipmentTableRowAction | null>
  >
}

export function ShipmentTableActions({
  shipmentRow,
  setRowAction,
}: TableActionsProps) {
  const shipment = shipmentRow.row.original
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon-sm"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Can permission={"clients:view"}>
            <DropdownMenuItem
              onClick={() =>
                setRowAction({ row: shipmentRow.row, variant: "view" })
              }
            >
              <EyeIcon />
              View
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:reject"}>
            {isNotInEnum(shipment.status, [
              "invoiced",
              "accepted",
              "rejected",
            ]) && (
              <DropdownMenuItem variant="destructive" onClick={() => {}}>
                Mark Rejected
              </DropdownMenuItem>
            )}
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
