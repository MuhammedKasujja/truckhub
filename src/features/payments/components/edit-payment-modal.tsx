"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PaymentEditSchemaType, createEditPaymentSchema } from "../schemas";
import z from "zod";
import { FieldGroup } from "@/components/ui/field";
import {
  AutoCompleteField,
  TextareaField,
  NumberField,
} from "@/components/ui/form-fields";
import { toast } from "sonner";
import { updatePayment, createPayment } from "../service";
import React from "react";
import { PaymentModeList } from "@/config/constants";

type PaymentFormProps = {
  initialData?: Partial<PaymentEditSchemaType>;
  trigger?: React.ReactNode;
};

export function EditPaymentModal({ initialData, trigger }: PaymentFormProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const tr = useTranslation();

  const isEdit = !!initialData && "id" in initialData;

  const formSchema = createEditPaymentSchema(initialData?.amount);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updatePayment(values) : createPayment(values);

    const { isSuccess, error, message } = await promise;
    if (isSuccess) {
      toast.success(message);
      form.reset();
      setIsOpen(false);
    } else {
      toast.error(error?.message);
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
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log(errors);
            })}
            id="form-payment"
          >
            <FieldGroup className="grid grid-flow-row grid-cols-1">
              <NumberField
                label={initialData?.type === "ride" ? "Ride" : "Booking"}
                name={"entity_id"}
                control={form.control}
              />
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
          <Button type="submit" form="form-payment">
            {form.formState.isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {form.formState.isSubmitting
              ? "Submitting..."
              : `${tr("common.form.submit")}`}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
