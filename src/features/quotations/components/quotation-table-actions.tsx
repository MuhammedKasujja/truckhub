import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
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
import { quotationActions } from "../format"
import {
  useAcceptQuotation,
  useMarkQuotationCancelled,
  useMarkQuotationRejected,
  useSendQuotationEmail,
} from "../hooks/use-quotation-actions"
import { ActionIcon } from "@/components/icons"

interface TableActionsProps {
  quotation: Quotation
  setRowAction?: React.Dispatch<
    React.SetStateAction<QuotationTableRowAction | null>
  >
}

export function QuotationTableActions({ quotation }: TableActionsProps) {
  const { acceptQuotation } = useAcceptQuotation()
  const { markQuotationRejected } = useMarkQuotationRejected()
  const { sendQuotationEmail } = useSendQuotationEmail()
  const { markQuotationCancelled } = useMarkQuotationCancelled()
  const allowed = quotationActions(quotation.status)
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
                <ActionIcon action="edit" />
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
                <ActionIcon action="view" />
                View
              </Link>
            </DropdownMenuItem>
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:accept"}>
            {allowed.accept && (
              <DropdownMenuItem onClick={() => acceptQuotation(quotation.id)}>
                Mark Accepted
              </DropdownMenuItem>
            )}
          </Can>
          <Can permission={"quotations:email"}>
            <DropdownMenuItem onClick={() => sendQuotationEmail(quotation.id)}>
              <ActionIcon action="email" />
              Email
            </DropdownMenuItem>
          </Can>
          <Can permission={"quotations:cancel"}>
            {allowed.cancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => markQuotationCancelled(quotation.id)}
                >
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </Can>
          <DropdownMenuSeparator />
          <Can permission={"quotations:reject"}>
            {allowed.reject && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => markQuotationRejected(quotation.id)}
              >
                Mark Rejected
              </DropdownMenuItem>
            )}
          </Can>
          <DropdownMenuItem asChild>
            <Link
              to={"/quotations/$quotationId/pdf"}
              params={{ quotationId: quotation.id }}
            >
              <ActionIcon action="view-pdf"/>
              View Pdf
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
