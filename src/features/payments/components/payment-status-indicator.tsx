import { Badge } from "@/components/ui/badge"
import { PaymentStatus } from "../types"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type Props = {
  status: PaymentStatus
}

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "completed":
      return "bg-emerald-500";
    case "partially_refunded":
      return "bg-muted-foreground/64";
    case "pending":
      return "bg-amber-500";
    case "cancelled":
    case "failed":
      return "bg-red-500";
    default:
      return "bg-muted-foreground/64";
  }
};

export function PaymentStatusIndicator({ status }: Props) {
  const tr = useTranslation()
  return (
    <Badge
      variant="outline"
      className="flex items-center justify-center rounded-sm capitalize"
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-sm", getStatusColor(status))}
      />
      {tr(`payments.statuses.${status}`)}
    </Badge>
  )
}
