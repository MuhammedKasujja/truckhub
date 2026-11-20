import { PaymentViewModal } from "./payment-view-modal"
import { ReversePaymentModal } from "./reverse-payment-modal"
import type { PaymentTableRowAction } from "../types"
import { Can } from "@/components/has-permission"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { isNotInEnum } from "@/common/enums"

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
        key={`view-${payment.id}`}
        payment={payment}
        open={rowAction.variant === "view"}
        onOpenChange={handleClose}
        onReverse={
          isNotInEnum(payment.status, ["reversed"])
            ? () => setRowAction({ row: rowAction.row, variant: "reverse" })
            : undefined
        }
      />
      {isNotInEnum(payment.status, ["reversed"]) && (
        <Can permission="payments:reverse">
          <ReversePaymentModal
            key={`reverse-${payment.id}`}
            payment={payment}
            open={rowAction.variant === "reverse"}
            onOpenChange={handleClose}
          />
        </Can>
      )}
      <Can permission="payments:delete">
        <ConfirmDialog
          open={rowAction.variant === "delete"}
          onOpenChange={handleClose}
          // isLoading={deleteItem.isPending}
          onConfirm={
            () => {}
            // deleteItem.mutate(id, {
            //   onSuccess: () => setConfirmOpen(false),
            //   onError: (e) => toast.error(e.message),
            // })
          }
        />
      </Can>
    </div>
  )
}
