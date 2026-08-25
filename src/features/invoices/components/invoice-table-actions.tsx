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
import { InvoiceTableRowAction } from "../types"
import { isNotInEnum } from "@/common/types"

export type SetInvoiceTableAction = React.Dispatch<
  React.SetStateAction<InvoiceTableRowAction | null>
>
type Row = Pick<InvoiceTableRowAction, "row">

interface TableActionsProps {
  invoiceRow: Row
  setRowAction: SetInvoiceTableAction
}

export function InvoiceTableActions({
  invoiceRow,
  setRowAction,
}: TableActionsProps) {
  const invoice = invoiceRow.row.original
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
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({ row: invoiceRow.row, variant: "makePayment" })
                }
              >
                <CreditCard />
                Payment
              </DropdownMenuItem>
            )}
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"invoices:pdf"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/billing/invoices/$invoiceId/pdf"}
                params={{ invoiceId: invoice.id }}
              >
                <EyeIcon />
                Pdf
              </Link>
            </DropdownMenuItem>
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
