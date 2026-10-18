import { Button } from "@/components/ui/button"
import { Payment, PaymentTableRowAction } from "../types"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"
import { PaymentViewModal } from "./payment-view-modal"
import { ActionButton } from "@/components/ui/action-button"
import { usePaymentReverse } from "../hooks/use-payments"

interface TableActionsProps {
  payment: Payment
  setRowAction?: React.Dispatch<
    React.SetStateAction<PaymentTableRowAction | null>
  >
}

export function PaymentTableActions({ payment }: TableActionsProps) {
  const { mutate: reverse } = usePaymentReverse()

  return (
    <div className="flex gap-2">
      <PaymentViewModal payment={payment} />
      <Can permission="payments:delete">
        <ActionButton
          variant={"destructive"}
          size={"icon"}
          requireAreYouSure
          action={async () => {
            return { error: true, message: "Not implemented yet...." }
          }}
        >
          <ActionIcon action="delete" />
        </ActionButton>
      </Can>
      <Can permission="payments:reverse">
        <Button
          size={"icon"}
          variant={"secondary"}
          onClick={() => reverse({ paymentId: payment.id })}
        >
          <ActionIcon action="reverse" />
        </Button>
      </Can>
    </div>
  )
}
