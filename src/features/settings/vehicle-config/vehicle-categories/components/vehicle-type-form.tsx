import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  VehicleCategoryCreateSchema,
  VehicleCategoryUpdateSchema,
} from "@/features/settings/vehicle-config/vehicle-categories/schemas"
import { SelectField, TextField } from "@/components/ui/form-fields"
import React from "react"
import { SubmitButton } from "@/components/ui/submit-button"
import { useTranslation } from "@/i18n"
import { VehicleCategoryPickerField } from "./vehicle-category-pickers"
import { ActionIcon } from "@/components/icons"
import { vehicleTypesList } from "../enums"
import { BaseFormProps } from "@/common/types"

type VehicleCategoryFormProps = {
  trigger?: React.ReactNode
} & BaseFormProps<
  z.infer<typeof VehicleCategoryCreateSchema>,
  z.infer<typeof VehicleCategoryUpdateSchema>
>

export function VehicleCategoryForm({
  trigger,
  defaultValues,
  mode,
  onSubmit,
}: VehicleCategoryFormProps) {
  const tr = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isEdit = mode === "edit"

  const formSchema = isEdit
    ? VehicleCategoryUpdateSchema
    : VehicleCategoryCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (mode === "edit") {
      onSubmit(VehicleCategoryUpdateSchema.parse(values))
    } else {
      onSubmit(VehicleCategoryCreateSchema.parse(values))
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="font-normal">
            <ActionIcon action="create" />
            Vehicle Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Vehicle Category" : "New Vehicle Category"}
            </DialogTitle>
            <DialogDescription>Create new vehicle category</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
              <VehicleCategoryPickerField
                label="Parent Category"
                name={"parent_category_id"}
                control={form.control}
                required={false}
                description="Leave blank if this is the main category"
              />
              <SelectField
                label={"Type"}
                control={form.control}
                name={"type"}
                placeholder="Select type"
                options={vehicleTypesList.map((opt) => ({
                  label: tr(`vehicleTypes.${opt}`),
                  value: opt,
                }))}
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
  )
}
