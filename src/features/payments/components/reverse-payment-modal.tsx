import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/i18n"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { reversePaymentSchema } from "@/features/payments/schemas"
import z from "zod"
import { FieldGroup } from "@/components/ui/field"
import { TextareaField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { usePaymentReverse } from "../hooks/use-payments"
import { Payment } from "../types"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const isMobile = useIsMobile()

  const tr = useTranslation()
  const { mutate, isPending } = usePaymentReverse()

  const form = useForm<z.infer<typeof reversePaymentSchema>>({
    resolver: zodResolver(reversePaymentSchema),
    defaultValues: { paymentId: payment.id },
    mode: "onChange",
  })

  async function onSubmit(values: z.infer<typeof reversePaymentSchema>) {
    mutate(values, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="gap-1">
          <DialogTitle>Reverse Payment</DialogTitle>
          <DialogDescription>Add reverse reason</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log(errors)
            })}
            id="form-payment"
          >
            <FieldGroup className="grid grid-flow-row grid-cols-1">
              <TextareaField
                label={"Reason"}
                name={"reason"}
                control={form.control}
                required={false}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <SubmitButton
            type="submit"
            text="Yes, Reverse"
            form="form-payment"
            isSubmitting={isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
