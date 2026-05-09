import { Payment } from "@/features/payments/types";
import {
  Ban,
  CircleDotDashed,
  CircleHelp,
  CircleX,
  LucideIcon,
  Timer,
} from "lucide-react";

export function getPaymentStatusIcon(status: Payment["status"]) {
  const statusIcons: Record<Payment["status"], LucideIcon> = {
    pending: CircleDotDashed,
    cancelled: CircleX,
    refunded: Timer,
    failed: Ban,
    completed: Timer,
    partially_refunded: CircleHelp,
  };
  return statusIcons[status];
}
