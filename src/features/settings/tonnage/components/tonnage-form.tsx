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
  TonnageCreateSchema,
  TonnageUpdateSchema,
} from "@/features/settings/tonnage/schemas";
import {
  createTonnage,
  updateTonnage,
} from "@/features/settings/tonnage/service";
import { NumberField, TextField } from "@/components/ui/form-fields";
import React from "react";
import { FieldGroup } from "@/components/ui/field";
import { useTranslation } from "@/i18n";
import { SubmitButton } from "@/components/ui/submit-button";

type TonnageFormProps = {
  trigger?: React.ReactNode;
  initialData?: z.infer<typeof TonnageUpdateSchema>;
};

export function TonnageForm({ trigger, initialData }: TonnageFormProps) {
  const tr = useTranslation();
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const formSchema = isEdit ? TonnageUpdateSchema : TonnageCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateTonnage(values) : createTonnage(values);

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
            Tonnage
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <Button variant={"outline"} size={"icon"} type="button">
                <PlusIcon />
              </Button>
              {isEdit ? "Edit Tonnage" : "Tonnage"}
            </DialogTitle>
            <DialogDescription>Create new truck tonnage</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label="Name" control={form.control} name={"tonnage"} />
            <NumberField
              label={"Minimum Tonnage"}
              control={form.control}
              name={"tonnage_min"}
              placeholder="Min tonnage the truck can carry"
            />
            <NumberField
              label={"Maximum Tonnage"}
              control={form.control}
              name={"tonnage_max"}
              placeholder="Max tonnage the truck can carry"
            />
          </FieldGroup>
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
