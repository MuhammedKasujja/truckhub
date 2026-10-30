import { Button } from "@/components/ui/button"
import { MoreHorizontal, TypeIcon } from "lucide-react"
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
import { ClientsTableRowAction } from "../types"
import { useChangeClientType } from "../hooks/use-client"
import { toast } from "sonner"
import { ActionIcon } from "@/components/icons"

type Row = Pick<ClientsTableRowAction, "row">

interface ClientTableActionsProps {
  row: Row
  setRowAction?: React.Dispatch<
    React.SetStateAction<ClientsTableRowAction | null>
  >
}

export function ClientTableActions({
  row,
  setRowAction,
}: ClientTableActionsProps) {
  const client = row?.row.original
  const { changeClientType, isSuccess } = useChangeClientType()

  if (isSuccess) {
    toast.success("Client type change successfully")
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={"icon-sm"}>
            {/* <MoreVertical /> */}
            <MoreHorizontal/>
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
                  <ActionIcon action="edit" />
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
                  <ActionIcon action="view" />
                  View
                </Link>
              </DropdownMenuItem>
            </Can>
            <Can permission={"quotations:create"}>
              <DropdownMenuItem asChild>
                <Link to={"/quotations/new"} search={{ clientId: client.id }}>
                  <ActionIcon action="create" />
                  Quotation
                </Link>
              </DropdownMenuItem>
            </Can>
            <Can permission={"invoices:create"}>
              <DropdownMenuItem asChild>
                <Link to={"/invoices/create"} search={{ clientId: client.id }}>
                  <ActionIcon action="create" />
                  Invoice
                </Link>
              </DropdownMenuItem>
            </Can>
            <Can permission={"clients:change_type"}>
              <DropdownMenuItem onClick={() => changeClientType(client.id)}>
                <TypeIcon />
                {client.client_type}
              </DropdownMenuItem>
            </Can>
            <Can permission={"clients:delete"}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  setRowAction?.({ row: row.row, variant: "delete" })
                }
              >
                <ActionIcon action="delete" />
                Delete
              </DropdownMenuItem>
            </Can>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
