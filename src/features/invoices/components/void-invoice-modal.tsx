import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useVoidInvoice } from "../hooks/use-invoice-actions"
import { voidInvoiceSchema } from "../schemas"
import type { VoidInvoiceInput } from "../schemas"
import type { Invoice } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TextareaField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { formatMoney } from "@/lib/format"

type Props = {
  invoice: Pick<Invoice, "id" | "number" | "total" | "amount_paid" | "client">
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoidInvoiceModal({ invoice, open, onOpenChange }: Props) {
  const { voidInvoice, isPending } = useVoidInvoice()

  const form = useForm<VoidInvoiceInput>({
    resolver: zodResolver(voidInvoiceSchema),
    defaultValues: { invoiceId: invoice.id, reason: "" },
  })

  const paid = Number(invoice.amount_paid ?? 0)

  async function onSubmit(values: VoidInvoiceInput) {
    try {
      await voidInvoice(values)
      form.reset()
      onOpenChange(false)
    } catch {
      // The hook already shows the error; keep the dialog open to retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle>Void invoice {invoice.number}</DialogTitle>
          <DialogDescription>
            The client will no longer owe this invoice. This can't be undone.
          </DialogDescription>
        </DialogHeader>

        <form
          id="form-void-invoice"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <section className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Invoice total</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatMoney(invoice.total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoice.client.name}
            </p>
            <ul className="mt-4 list-disc space-y-1.5 border-t pt-4 pl-4 text-sm text-muted-foreground">
              <li>Its shipments can be invoiced again.</li>
              {paid > 0 ? (
                <li>
                  The {formatMoney(invoice.amount_paid)} already paid stays
                  with the client as credit. Reverse the payment to refund it.
                </li>
              ) : (
                <li>No payments have been applied to it.</li>
              )}
            </ul>
          </section>

          <TextareaField
            label="Reason for voiding"
            name="reason"
            control={form.control}
            placeholder="e.g. Issued with the wrong shipments"
            description="Saved on the invoice's activity timeline."
            rows={3}
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <SubmitButton
            form="form-void-invoice"
            variant="destructive"
            text="Void invoice"
            loadingText="Voiding..."
            isSubmitting={isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
