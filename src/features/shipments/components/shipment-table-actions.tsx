import { Button } from "@/components/ui/button"
import { EditIcon, EyeIcon, MailIcon, MoreVertical } from "lucide-react"
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
import { Shipment, ShipmentTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

interface TableActionsProps {
  shipment: Shipment
  setRowAction?: React.Dispatch<
    React.SetStateAction<ShipmentTableRowAction | null>
  >
}

export function ShipmentTableActions({ shipment }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon-sm"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Can permission={"quotations:edit"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/quotations/$quotationId/edit"}
                params={{ quotationId: shipment.id }}
              >
                <EditIcon />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"clients:view"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/quotations/$quotationId/view"}
                params={{ quotationId: shipment.id }}
              >
                <EyeIcon />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:accept"}>
            {isNotInEnum(shipment.status, ["accepted"]) && (
              <DropdownMenuItem onClick={() => {}}>
                Mark Accepted
              </DropdownMenuItem>
            )}
          </Can>
          <Can permission={"quotations:email"}>
            <DropdownMenuItem>
              <MailIcon />
              Email
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
