import type { InvoiceStatus } from "../enums"
import { useTranslation } from "@/i18n"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"
import { cn } from "@/lib/utils"

type StatusTone = "success" | "info" | "warning" | "error" | "default"

const INVOICE_STATUS_TONE: Record<InvoiceStatus, StatusTone> = {
  draft: "default",
  issued: "info",
  mailed: "info",
  partially_paid: "warning",
  over_due: "error",
  paid: "success",
  refunded: "default",
  cancelled: "default",
  void: "default",
}

type Props = {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusIndicator({ status, className }: Props) {
  const tr = useTranslation()
  return (
    <Status
      variant={INVOICE_STATUS_TONE[status]}
      className={cn("gap-1.5 py-0.5", className)}
    >
      <StatusIndicator />
      <StatusLabel>{tr(`invoices.statuses.${status}`)}</StatusLabel>
    </Status>
  )
}
