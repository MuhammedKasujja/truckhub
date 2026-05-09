"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  AutoCompleteField,
  NumberField,
  TextareaField,
  TextField,
} from "@/components/ui/form-fields";
import { useTranslation } from "@/i18n";
import {
  ServiceCreateSchema,
  ServiceUpdateSchema,
} from "@/features/services/schemas";
import { createService, updateService } from "@/features/services/service";
import { getVehicleSettings } from "@/server/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { SubmitButton } from "@/components/ui/submit-button";

type ServiceFormProps = {
  vehicleConfigPromise: Promise<Awaited<ReturnType<typeof getVehicleSettings>>>;
  initialData?: z.infer<typeof ServiceUpdateSchema>;
};

export function ServiceForm({
  vehicleConfigPromise,
  initialData,
}: ServiceFormProps) {
  const tr = useTranslation();
  const { data } = React.use(vehicleConfigPromise);

  const isEdit = !!initialData;

  const formSchema = isEdit ? ServiceUpdateSchema : ServiceCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateService(values) : createService(values);

    const { isSuccess, error, message } = await promise;
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(error?.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? tr("services.edit_service") : tr("services.new_service")}
        </CardTitle>
        <CardDescription>{tr("services.create_new_service")}</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors);
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup className="grid grid-flow-row grid-cols-1 md:grid-cols-2">
            <AutoCompleteField
              label={tr("common.vehicle_type")}
              control={form.control}
              name={"vehicle_type_id"}
              placeholder="Select Vehicle"
              emptyPlaceholder="No vehicles found"
              options={
                data?.vehicle_types.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                })) ?? []
              }
            />
            <TextField
              label={tr("common.form.name")}
              name={"name"}
              control={form.control}
            />
            {/* <TextField
              label={tr("common.display_name")}
              name={"display_name"}
              control={form.control}
            /> */}
            <Field orientation={"horizontal"}>
              <TextField
                label={"Start Year"}
                name={"start_year"}
                control={form.control}
              />
              <TextField
                label={"End Year"}
                name={"end_year"}
                control={form.control}
              />
            </Field>
            <NumberField
              label={tr("services.seats")}
              name={"seats"}
              control={form.control}
              required={false}
            />
            <NumberField
              label={"Minimum Hire Fee"}
              name={"minimum_hire_fee"}
              control={form.control}
              required={false}
            />
            <NumberField
              label={tr("services.base_fare")}
              name={"base_fare"}
              control={form.control}
              required={false}
            />
            <NumberField
              label={tr("services.min_fare")}
              name={"min_fare"}
              control={form.control}
              required={false}
            />
            <NumberField
              label={tr("services.price_per_min")}
              name={"price_per_min"}
              control={form.control}
            />
            <NumberField
              label={tr("services.price_per_unit_distance")}
              name={"price_per_unit_distance"}
              control={form.control}
            />
            <NumberField
              label={tr("services.booking_fee")}
              name={"booking_fee"}
              control={form.control}
              required={false}
            />
            <NumberField
              label={tr("services.tax_fee")}
              name={"tax_fee"}
              control={form.control}
              required={false}
            />
            <TextareaField
              label={tr("common.form.description")}
              name={"description"}
              control={form.control}
              required={false}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton
            text={tr("common.form.submit")}
            isSubmitting={form.formState.isSubmitting}
          />
        </CardFooter>
      </form>
    </Card>
  );
}
