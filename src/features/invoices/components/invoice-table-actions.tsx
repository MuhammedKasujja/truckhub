import { Button } from "@/components/ui/button"
import {
  CreditCard,
  EditIcon,
  EyeIcon,
  MailIcon,
  MoreVertical,
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
import { Invoice, InvoiceTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

interface TableActionsProps {
  invoice: Invoice
  setRowAction?: React.Dispatch<
    React.SetStateAction<InvoiceTableRowAction | null>
  >
}

export function InvoiceTableActions({ invoice }: TableActionsProps) {
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
                to={"/billing/invoices/$invoiceId/view"}
                params={{ invoiceId: invoice.id }}
              >
                <EditIcon />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"invoices:view"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/billing/invoices/$invoiceId/view"}
                params={{ invoiceId: invoice.id }}
              >
                <EyeIcon />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"payments:create"}>
            {isNotInEnum(invoice.status, ["paid"]) && (
              <DropdownMenuItem>
                <CreditCard />
                Payment
              </DropdownMenuItem>
            )}
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"invoices:email"}>
            <DropdownMenuItem>
              <MailIcon />
              Email
            </DropdownMenuItem>
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
