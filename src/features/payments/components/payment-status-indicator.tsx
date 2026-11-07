import type { PaymentStatus } from "../types"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type StatusTone = "success" | "info" | "warning" | "error" | "default"

const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  completed: "success",
  pending: "warning",
  partially_refunded: "info",
  reversed: "default",
  cancelled: "default",
  failed: "error",
}

type Props = {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusIndicator({ status, className }: Props) {
  const tr = useTranslation()
  return (
    <Status
      variant={PAYMENT_STATUS_TONE[status]}
      className={cn("gap-1.5 py-0.5", className)}
    >
      <StatusIndicator />
      <StatusLabel>{tr(`payments.statuses.${status}`)}</StatusLabel>
    </Status>
  )
}
