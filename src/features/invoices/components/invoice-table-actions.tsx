import { Button } from "@/components/ui/button"
import { Ban, CreditCard, MailIcon, MoreVertical } from "lucide-react"
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
import { isChargedInvoice, isDeletableInvoice } from "../enums"
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
  // Draft, cancelled and void invoices are neither emailed nor voided
  const isCharged = isChargedInvoice(invoice.status)
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
          {isCharged && (
            <>
              <Can permission={"invoices:email"}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => sendInvoiceEmail(invoice.id)}>
                  <MailIcon />
                  {invoice.send_count > 0 ? "Resend Email" : "Send Email"}
                </DropdownMenuItem>
              </Can>
              <Can permission={"invoices:void"}>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    setRowAction({ row: invoiceRow.row, variant: "void" })
                  }
                >
                  <Ban />
                  Void
                </DropdownMenuItem>
              </Can>
            </>
          )}
          {isDeletableInvoice(invoice.status) && (
            <Can permission={"invoices:delete"}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  setRowAction({ row: invoiceRow.row, variant: "delete" })
                }
              >
                <ActionIcon action="delete" />
                Delete
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
