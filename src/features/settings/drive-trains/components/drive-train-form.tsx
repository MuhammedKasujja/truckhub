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
  DriveTrainCreateSchema,
  DriveTrainUpdateSchema,
} from "@/features/settings/drive-trains/schemas";
import {
  createDriveTrain,
  updateDriveTrain,
} from "@/features/settings/drive-trains/service";
import { SwitchField, TextField } from "@/components/ui/form-fields";
import React from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { useTranslation } from "@/i18n";

type Props = {
  trigger?: React.ReactNode;
  initialData?: z.infer<typeof DriveTrainUpdateSchema>;
};

export function DriveTrainForm({ trigger, initialData }: Props) {
  const tr = useTranslation();
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const formSchema = isEdit ? DriveTrainUpdateSchema : DriveTrainCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateDriveTrain(values) : createDriveTrain(values);

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
            Drive train
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Drive train</DialogTitle>
            <DialogDescription>Create new Drive train</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
              <SwitchField
                label="Truck"
                control={form.control}
                name={"type"}
                description="When checked it means the drive train is for trucks"
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
