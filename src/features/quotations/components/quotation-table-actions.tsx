import { Button } from "@/components/ui/button"
import { EditIcon, EyeIcon, MoreVertical } from "lucide-react"
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
import { Quotation, QuotationTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

interface TableActionsProps {
  quotation: Quotation
  setRowAction?: React.Dispatch<
    React.SetStateAction<QuotationTableRowAction | null>
  >
}

export function QuotationTableActions({ quotation }: TableActionsProps) {
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
                params={{ quotationId: quotation.id }}
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
                params={{ quotationId: quotation.id }}
              >
                <EyeIcon />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:accept"}>
            {isNotInEnum(quotation.status, ["accepted"]) && (
              <DropdownMenuItem onClick={() => {}}>
                Mark Accepted
              </DropdownMenuItem>
            )}
          </Can>
          <Can permission={"quotations:email"}>
            <DropdownMenuItem>Email</DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:reject"}>
            {isNotInEnum(quotation.status, [
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
