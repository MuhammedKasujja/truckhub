import { Button } from "@/components/ui/button"
import {
  CreditCard,
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
import { useSendInvoiceEmail } from "../hooks/use-invoice-actions"
import { ActionIcon } from "@/components/icons"

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
  const { sendInvoiceEmail } = useSendInvoiceEmail()
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
                to={"/invoices/$invoiceId/view"}
                params={{ invoiceId: invoice.id }}
              >
                <ActionIcon action="edit" />
                Edit
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"invoices:view"}>
            <DropdownMenuItem asChild>
              <Link
                to={"/invoices/$invoiceId/view"}
                params={{ invoiceId: invoice.id }}
              >
                <ActionIcon action="view" />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={"payments:create"}>
            {invoice.is_payable && (
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
                to={"/invoices/$invoiceId/pdf"}
                params={{ invoiceId: invoice.id }}
              >
                <ActionIcon action='view-pdf'/>
                View Pdf
              </Link>
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"invoices:email"}>
            <DropdownMenuItem onClick={() => sendInvoiceEmail(invoice.id)}>
              <MailIcon />
              Send Email
            </DropdownMenuItem>
          </Can>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
