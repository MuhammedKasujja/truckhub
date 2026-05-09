"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  AutoCompleteField,
  NumberField,
  TextareaField,
} from "@/components/ui/form-fields";
import { useTranslation } from "@/i18n";
import { PaymentEditSchemaType, createEditPaymentSchema } from "@/features/payments/schemas";
import { createPayment, updatePayment } from "@/features/payments/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { PaymentModeList } from "@/config/constants";

type PaymentFormProps = {
  initialData?: Partial<PaymentEditSchemaType>;
};

export function PaymentForm({ initialData }: PaymentFormProps) {
  const tr = useTranslation();

  const isEdit = !!initialData && 'id' in initialData;

  const schema = createEditPaymentSchema(initialData?.amount)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const promise =
      "id" in values ? updatePayment(values) : createPayment(values);

    const { isSuccess, error, message } = await promise;
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(error?.message);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log(errors);
      })}
    >
      <FieldGroup className="grid grid-flow-row grid-cols-1">
        <NumberField
          label={"Booking"}
          name={"entity_id"}
          control={form.control}
        />
        <NumberField label={"Amount"} name={"amount"} control={form.control} />
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
      <Button type="submit">
        {form.formState.isSubmitting && (
          <Loader2 className="size-4 animate-spin" />
        )}
        {form.formState.isSubmitting
          ? "Submitting..."
          : `${tr("common.form.submit")}`}
      </Button>
    </form>
  );
}
