import { QUOTATION_STATUS_META } from "../../format"
import type { QuotationStatus } from "../../enums"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"
import { cn } from "@/lib/utils"

export function QuotationStatusIndicator({
  status,
  className,
}: {
  status: QuotationStatus
  className?: string
}) {
  const meta = QUOTATION_STATUS_META[status]
  return (
    <Status variant={meta.tone} className={cn("gap-1.5 py-0.5", className)}>
      <StatusIndicator />
      <StatusLabel>{meta.label}</StatusLabel>
    </Status>
  )
}
