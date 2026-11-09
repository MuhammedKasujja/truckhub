import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  UserRound,
  XCircle,
} from "lucide-react"
import { quotationActions } from "../../format"
import {
  useAcceptQuotation,
  useMarkQuotationCancelled,
  useMarkQuotationRejected,
  useSendQuotationEmail,
} from "../../hooks/use-quotation-actions"
import { QuotationStatusIndicator } from "./quotation-status-indicator"
import type { Quotation } from "../../types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { PageBackButton } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/format"

type Props = {
  quotation: Quotation
  /** Key numbers strip rendered along the bottom of the card. */
  children?: React.ReactNode
}

export function QuotationDetailsPageHeader({ quotation, children }: Props) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="-ml-2 pt-1">
            <PageBackButton />
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
            <FileText className="size-7" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Quotation · v{quotation.versions.length}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {quotation.number}
              </h1>
              <QuotationStatusIndicator status={quotation.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <Link
                to="/clients/$clientId/view"
                params={{ clientId: quotation.client.id }}
                className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
              >
                <UserRound className="size-3.5" />
                <span className="capitalize">{quotation.client.name}</span>
              </Link>
              <span>Issued {formatDate(quotation.created_at)}</span>
              <span>Updated {formatDate(quotation.last_updated_at)}</span>
            </div>
          </div>
        </div>

        <QuotationActions quotation={quotation} />
      </div>

      {children && <div className="border-t">{children}</div>}
    </Card>
  )
}

function QuotationActions({ quotation }: { quotation: Quotation }) {
  const quotationId = quotation.id
  const allowed = quotationActions(quotation.status)
  const [confirm, setConfirm] = useState<"reject" | "cancel">()

  const { acceptQuotation, isPending: isAccepting } = useAcceptQuotation()
  const { sendEmail, isPending: isSending } = useSendQuotationEmail()
  const { markQuotationRejected, isPending: isRejecting } =
    useMarkQuotationRejected()
  const { markQuotationCancelled, isPending: isCancelling } =
    useMarkQuotationCancelled()

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {allowed.accept && (
        <Can permission="quotations:accept">
          <Button
            onClick={() => acceptQuotation(quotationId)}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Accept
          </Button>
        </Can>
      )}
      <Can permission="quotations:email">
        <Button
          variant="outline"
          onClick={() => sendEmail(quotationId)}
          disabled={isSending}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ActionIcon action="email" />
          )}
          Send email
        </Button>
      </Can>
      <Button variant="outline" asChild>
        <Link to="/quotations/$quotationId/pdf" params={{ quotationId }}>
          <ActionIcon action="view-pdf" />
          PDF
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            More
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <Can permission="quotations:edit">
            <DropdownMenuItem asChild>
              <Link to="/quotations/$quotationId/edit" params={{ quotationId }}>
                <ActionIcon action="edit" />
                Edit / new revision
              </Link>
            </DropdownMenuItem>
          </Can>
          {(allowed.reject || allowed.cancel) && <DropdownMenuSeparator />}
          {allowed.reject && (
            <Can permission="quotations:reject">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirm("reject")}
              >
                <XCircle className="size-4" />
                Mark rejected
              </DropdownMenuItem>
            </Can>
          )}
          {allowed.cancel && (
            <Can permission="quotations:cancel">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirm("cancel")}
              >
                <Ban className="size-4" />
                Cancel quotation
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm === "reject"}
        onOpenChange={() => setConfirm(undefined)}
        onConfirm={() => markQuotationRejected(quotationId)}
        isLoading={isRejecting}
        title={`Reject ${quotation.number}?`}
        description="The quotation will be marked as rejected by the client."
        confirmLabel="Mark rejected"
      />
      <ConfirmDialog
        open={confirm === "cancel"}
        onOpenChange={() => setConfirm(undefined)}
        onConfirm={() => markQuotationCancelled(quotationId)}
        isLoading={isCancelling}
        title={`Cancel ${quotation.number}?`}
        description="The accepted quotation will be cancelled."
        confirmLabel="Cancel quotation"
      />
    </div>
  )
}
