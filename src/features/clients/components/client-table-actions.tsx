import { Button } from "@/components/ui/button"
import {
  EditIcon,
  EyeIcon,
  MoreVertical,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
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
import { Client, ClientsDataTableRowAction } from "../types"

interface ClientTableActionsProps {
  client: Client
  setRowAction?: React.Dispatch<
    React.SetStateAction<ClientsDataTableRowAction | null>
  >
}

export function ClientTableActions({ client }: ClientTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Can permission={"clients:edit"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/clients/$clientId/edit"}
                params={{ clientId: client.id }}
              >
                <EditIcon />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"clients:view"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/clients/$clientId/view"}
                params={{ clientId: client.id }}
              >
                <EyeIcon />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"bookings:create"}>
            <DropdownMenuItem asChild>
              <Link to={"/bookings/new"} search={{ clientId: client.id }}>
                <PlusIcon />
                 Booking
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"rides:create"}>
            <DropdownMenuItem asChild>
              <Link to={"/rides/new"} params={{ clientId: client.id }}>
                <PlusIcon />
                Ride
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"rides:create"}>
            <DropdownMenuItem asChild>
              <Link to={"/clients/data/$clientId"} params={{ clientId: client.id }}>
                <EyeIcon />
                Pricing
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"clients:delete"}>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
