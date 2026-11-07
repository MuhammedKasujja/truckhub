import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react"
import type React from "react"
import type { PaymentMode } from "../types"

type IconType = React.ComponentType<{ className?: string }>

export const PAYMENT_METHOD_ICONS: Record<PaymentMode, IconType> = {
  cash: Banknote,
  mobile_money: Smartphone,
  bank_transfer: Landmark,
  credit_card: CreditCard,
}

/** What the transaction reference means for each payment method. */
export const PAYMENT_METHOD_REF_LABELS: Record<PaymentMode, string> = {
  cash: "Receipt number",
  mobile_money: "Transaction ID",
  bank_transfer: "Bank reference",
  credit_card: "Authorization code",
}
