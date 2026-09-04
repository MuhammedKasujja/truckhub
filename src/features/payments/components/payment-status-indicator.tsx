import { Badge } from "@/components/ui/badge"
import { PaymentStatus } from "../types"
import { useTranslation } from "@/i18n"

type Props = {
  status: PaymentStatus
}

export function PaymentStatusIndicator({ status }: Props) {
  const tr = useTranslation()
  return (
    <Badge variant="outline" className="capitalize rounded-sm flex justify-center items-center">
     {tr(`payments.statuses.${status}`)}
    </Badge>
  )
}
