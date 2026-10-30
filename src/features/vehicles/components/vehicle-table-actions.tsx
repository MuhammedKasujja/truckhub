import { Button } from "@/components/ui/button"
import { VehicleTableRowAction } from "../types"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"
import { Link } from "@tanstack/react-router"
import { ActionButton } from "@/components/ui/action-button"
import { toast } from "sonner"
import { deleteVehicleFn } from "../services"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

export type VehicleRowAction = React.Dispatch<
  React.SetStateAction<VehicleTableRowAction | null>
>

type Row = Pick<VehicleTableRowAction, "row">

interface TableActionsProps {
  vehicleRow: Row
  setRowAction: VehicleRowAction
}

export function VehicleTableActions({
  vehicleRow,
  setRowAction,
}: TableActionsProps) {
  const vehicle = vehicleRow.row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon-sm"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Can permission={"invoices:edit"}>
            <DropdownMenuItem asChild>
              <Link
                to={`/vehicles/$vehicleId/view`}
                params={{ vehicleId: vehicle.id }}
              >
                <ActionIcon action="view" />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"vehicles:edit"}>
            <DropdownMenuItem asChild>
              <Link
                to={`/vehicles/$vehicleId/edit`}
                params={{ vehicleId: vehicle.id }}
              >
                <ActionIcon action="edit" />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"vehicles:edit"}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                setRowAction({ row: vehicleRow.row, variant: "maintanence" })
              }
            >
              <ActionIcon action="create" />
              Maintanence
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </Can>
          <Can permission={"vehicles:delete"}>
            <ActionButton
              variant={"destructive"}
              requireAreYouSure
              action={async () => {
                const { isSuccess, error, message } = await deleteVehicleFn({
                  data: { id: vehicle.id },
                })
                if (isSuccess) {
                  toast.success(message)
                  return { error: false }
                } else {
                  return { error: true, message: error?.message }
                }
              }}
            >
              <ActionIcon action="delete" />
              Delete
            </ActionButton>
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
