"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import z from "zod";
import {
  VehicleTypeCreateSchema,
  VehicleTypeUpdateSchemaType,
  VehicleTypeUpdateSchema,
} from "@/features/settings/vehicle-types/schemas";
import {
  createVehicleType,
  updateVehicleType,
} from "@/features/settings/vehicle-types/service";
import { SwitchField, TextField } from "@/components/ui/form-fields";
import React from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { useTranslation } from "@/i18n";

type Props = {
  trigger?: React.ReactNode;
  initialData?: VehicleTypeUpdateSchemaType;
};

export function VehicleTypeForm({ trigger, initialData }: Props) {
  const tr = useTranslation();
  const [open, setOpen] = React.useState(false);
  console.table(initialData);

  const isEdit = !!initialData;

  const formSchema = isEdit ? VehicleTypeUpdateSchema : VehicleTypeCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateVehicleType(values) : createVehicleType(values);

    const { isSuccess, error, message } = await promise;
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(error?.message);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="font-normal">
            <PlusIcon />
            Vehicle Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Vehicle Type" : "Add Vehicle Type"}
            </DialogTitle>
            <DialogDescription>Create new vehicle type</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
              <SwitchField
                label="Truck Vehicle"
                control={form.control}
                name={"is_truck"}
                description="When checked indicates this is a truck vehicle"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <SubmitButton
              text={tr("common.form.submit")}
              isSubmitting={form.formState.isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
