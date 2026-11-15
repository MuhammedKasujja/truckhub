import { Button } from "@/components/ui/button"
import { EyeIcon, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShipmentTableRowAction } from "../types"

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon-sm"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              setRowAction({ row: shipmentRow.row, variant: "view" })
            }
          >
            <EyeIcon />
            View
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
