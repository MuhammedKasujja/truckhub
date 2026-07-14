"use client"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { CreditCard } from "lucide-react"
import { useTranslation } from "@/i18n"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  PaymentEditSchemaType,
  createEditPaymentSchema,
} from "@/features/payments/schemas"
import z from "zod"
import { FieldGroup } from "@/components/ui/field"
import {
  AutoCompleteField,
  TextareaField,
  NumberField,
} from "@/components/ui/form-fields"
import { toast } from "sonner"
import { updatePaymentFn, createPaymentFn } from "@/features/payments/services"
import React from "react"
import { PaymentModeList } from "@/config/constants"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { BookingPickerField } from "@/features/bookings/components/booking-picker"
import { RidePickerField } from "@/features/ride-requests/components"

type PaymentFormProps = {
  initialData?: Partial<PaymentEditSchemaType>
  trigger?: React.ReactNode
}

export function EditPaymentModal({ initialData, trigger }: PaymentFormProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  // const isEdit = !!initialData && "id" in initialData

  const formSchema = createEditPaymentSchema(initialData?.amount)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updatePaymentFn({ data: values })
        : createPaymentFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.payments.invalidate({
        entityId: initialData?.entity_id ?? "",
        type: initialData?.type ?? "booking",
      })
      form.reset()
      setIsOpen(false)
    } else {
      toast.error(error?.message)
    }
  }
  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DrawerTrigger asChild>
        {trigger ?? (
          <Button variant={"outline"}>
            <CreditCard />
            Pay
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Enter Payment</DrawerTitle>
          <DrawerDescription>Create a new payment</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2 text-sm">
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log(errors)
            })}
            id="form-payment"
          >
            <FieldGroup className="grid grid-flow-row grid-cols-1">
              {initialData?.type === "booking" && (
                <BookingPickerField
                  label="Booking"
                  control={form.control}
                  name={"entity_id"}
                  onSelected={(booking) => {
                    form.setValue("amount", Number(booking?.balance))
                  }}
                />
              )}
              {initialData?.type === "ride" && (
                <RidePickerField
                  label={"Ride"}
                  name={"entity_id"}
                  control={form.control}
                  onSelected={(ride) => {
                    form.setValue("amount", Number(ride?.balance))
                  }}
                />
              )}
              <NumberField
                label={"Amount"}
                name={"amount"}
                control={form.control}
              />
              <AutoCompleteField
                label={"Payment Method"}
                control={form.control}
                name={"payment_mode"}
                placeholder="Select payment method"
                emptyPlaceholder="No payment method found"
                options={
                  PaymentModeList.map((opt) => ({
                    label: tr(`payments.methods.${opt}`),
                    value: opt,
                  })) ?? []
                }
              />
              <TextareaField
                label={"Transaction Ref"}
                name={"transaction_ref"}
                control={form.control}
                required={false}
              />
            </FieldGroup>
          </form>
        </div>
        <DrawerFooter>
          <SubmitButton
            type="submit"
            form="form-payment"
            isSubmitting={form.formState.isSubmitting}
          />
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
