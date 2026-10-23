import { PaymentTableRowAction } from "../types"
import { Can } from "@/components/has-permission"
import { PaymentViewModal } from "./payment-view-modal"
import { ReversePaymentModal } from "./reverse-payment-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"

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
        <ConfirmDialog
          open={rowAction?.variant === "delete"}
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
