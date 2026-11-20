import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { usePaymentReverse } from "../hooks/use-payments"
import { PAYMENT_METHOD_REF_LABELS } from "./payment-method"
import type { ReversePaymentInput } from "@/features/payments/schemas"
import type { Payment } from "../types"
import { reversePaymentSchema } from "@/features/payments/schemas"
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
import { useTranslation } from "@/i18n"
import { formatDateTime, formatMoney } from "@/lib/format"

type FormProps = {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReversePaymentModal({
  payment,
  open,
  onOpenChange,
}: FormProps) {
  const tr = useTranslation()
  const { mutate, isPending } = usePaymentReverse()

  const form = useForm<ReversePaymentInput>({
    resolver: zodResolver(reversePaymentSchema),
    defaultValues: { paymentId: payment.id, reason: "" },
  })

  function onSubmit(values: ReversePaymentInput) {
    mutate(values, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-md">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle>Reverse payment {payment.number}</DialogTitle>
          <DialogDescription>
            This marks the payment as reversed and can't be undone.
          </DialogDescription>
        </DialogHeader>

        <form
          id="form-reverse-payment"
          onSubmit={form.handleSubmit(onSubmit)}
          className="-mx-1 flex flex-col gap-4 overflow-y-auto px-1 py-0.5"
        >
          <section className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Amount to reverse</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatMoney(payment.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              Paid {formatDateTime(payment.paid_at)} via{" "}
              {tr(`payments.methods.${payment.method}`)}
            </p>

            <dl className="mt-4 space-y-2.5 border-t pt-4">
              <Row
                label="Paid for"
                value={`${tr(`payments.${payment.entity_type}`)} ${payment.entity.number}`}
              />
              <Row
                label={tr("payments.client")}
                value={
                  <span className="capitalize">{payment.client.fullname}</span>
                }
              />
              <Row
                label={tr("payments.applied")}
                value={
                  <span className="tabular-nums">
                    {formatMoney(payment.applied)}
                  </span>
                }
              />
              {payment.transaction_ref && (
                <Row
                  label={PAYMENT_METHOD_REF_LABELS[payment.method]}
                  value={
                    <span className="font-mono text-xs">
                      {payment.transaction_ref}
                    </span>
                  }
                />
              )}
            </dl>
          </section>

          <TextareaField
            label="Reason for reversal"
            name="reason"
            control={form.control}
            placeholder="e.g. Payment was recorded against the wrong invoice"
            description="Saved on the payment and shown in its details."
            rows={3}
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {tr("payments.form.cancel")}
            </Button>
          </DialogClose>
          <SubmitButton
            form="form-reverse-payment"
            variant="destructive"
            text="Reverse payment"
            loadingText="Reversing..."
            isSubmitting={isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}
