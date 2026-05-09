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
  CarBrandCreateSchema,
  CarBrandUpdateSchema,
  CarBrandUpdateSchemaType,
} from "@/features/settings/car-brand/schemas";
import {
  createCarBrand,
  updateCarBrand,
} from "@/features/settings/car-brand/service";
import { TextField } from "@/components/ui/form-fields";
import React from "react";
import { useTranslation } from "@/i18n";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  trigger?: React.ReactNode;
  initialData?: CarBrandUpdateSchemaType;
};

export function CarBrandForm({ trigger, initialData }: Props) {
  const tr = useTranslation();

  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const formSchema = isEdit ? CarBrandUpdateSchema : CarBrandCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateCarBrand(values) : createCarBrand(values);

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
            Car Brand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Car Brand" : "Add Car Brand"}
            </DialogTitle>
            <DialogDescription>Create new car brand</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
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
