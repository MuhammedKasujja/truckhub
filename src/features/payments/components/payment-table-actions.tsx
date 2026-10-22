import { PaymentTableRowAction } from "../types"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"
import { PaymentViewModal } from "./payment-view-modal"
import { ActionButton } from "@/components/ui/action-button"
import { ReversePaymentModal } from "./reverse-payment-modal"

interface TableActionsProps {
  rowAction: PaymentTableRowAction | null
  setRowAction: React.Dispatch<
    React.SetStateAction<PaymentTableRowAction | null>
  >
}

export function PaymentTableActions({
  rowAction,
  setRowAction,
}: TableActionsProps) {
  const payment = rowAction?.row.original

  const handleClose = () => setRowAction(null)

  if (!payment) return

  return (
    <div className="flex gap-2">
      <PaymentViewModal
        key={rowAction?.row.original.id}
        payment={rowAction?.row.original}
        open={rowAction?.variant === "view"}
        onOpenChange={handleClose}
      />
      <Can permission="payments:reverse">
        <ReversePaymentModal
          key={rowAction?.row.original.id}
          payment={rowAction?.row.original}
          open={rowAction?.variant === "reverse"}
          onOpenChange={handleClose}
        />
      </Can>
      <Can permission="payments:delete">
        <ActionButton
          variant={"destructive"}
          size={"icon"}
          requireAreYouSure={rowAction?.variant === "delete"}
          action={async () => {
            return { error: true, message: "Not implemented yet...." }
          }}
        >
          <ActionIcon action="delete" />
        </ActionButton>
      </Can>
    </div>
  )
}
