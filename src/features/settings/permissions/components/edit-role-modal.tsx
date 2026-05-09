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
  RoleCreateSchema,
  RoleUpdateSchemaType,
  RoleUpdateSchema,
} from "@/features/settings/permissions/schemas";
import { TextField } from "@/components/ui/form-fields";
import React from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { useTranslation } from "@/i18n";
import { createRole, updateRole } from "@/features/settings/permissions/service";

type EditRoleDialogProps = {
  trigger?: React.ReactNode;
  initialData?: RoleUpdateSchemaType;
};

export function EditRoleDialog({ initialData }: EditRoleDialogProps) {
  const tr = useTranslation();
  const [open, setOpen] = React.useState(false);

  const isEdit = !!initialData;

  const formSchema = isEdit ? RoleUpdateSchema : RoleCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateRole(values) : createRole(values);

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
        <Button size="sm" className="font-normal">
          <PlusIcon />
          Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Role" : "New Role"}</DialogTitle>
            <DialogDescription>Create user role</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <TextField label="Name" control={form.control} name={"name"} />
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
