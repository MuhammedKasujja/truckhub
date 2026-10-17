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
  CarModelCreateSchema,
  CarModelUpdateSchema,
} from "@/features/settings/vehicle-config/car-model/schemas"
import {
  ImageField,
  TextField,
  YearPickerField,
} from "@/components/ui/form-fields"
import React from "react"
import { Field, FieldGroup } from "@/components/ui/field"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { CarBrandPickerField } from "@/features/settings/vehicle-config/car-brand/components"
import { VehicleCategoryPickerField } from "@/features/settings/vehicle-config/vehicle-categories/components"
import { ActionIcon } from "@/components/icons"
import { BaseFormProps } from "@/common/types"

type CarModelFormProps = BaseFormProps<
  z.infer<typeof CarModelCreateSchema>,
  z.infer<typeof CarModelUpdateSchema>
> & {
  trigger?: React.ReactNode
}

export function CarModelForm({
  trigger,
  defaultValues,
  mode,
  onSubmit,
}: CarModelFormProps) {
  const tr = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isEdit = mode === "edit"

  const formSchema = isEdit ? CarModelUpdateSchema : CarModelCreateSchema

  type Values = z.infer<typeof formSchema>

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  async function handleSubmit(values: Values) {
    if (mode === "edit") {
      onSubmit(CarModelUpdateSchema.parse(values))
    } else {
      onSubmit(CarModelCreateSchema.parse(values))
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="font-normal">
            <ActionIcon action="create" />
            Car Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] min-h-[95vh] overflow-hidden sm:max-w-3xl">
        <form
          onSubmit={form.handleSubmit(handleSubmit, (error) => {
            console.log(error)
          })}
          className="max-h-[90vh] space-y-5 overflow-y-auto"
        >
          <DialogHeader className="border-b">
            <DialogTitle className="flex items-center gap-2">
              <Button variant={"outline"} size={"icon"} type="button">
                <ActionIcon action="create" />
              </Button>
              Car Model
            </DialogTitle>
            <DialogDescription>Create new car model</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageField
              control={form.control}
              name={"image"}
              className="col-span-2"
              aspect={16 / 9}
              src={form.getValues("image_url")}
              width="full"
            />
            <FieldGroup className="col-span-2">
              <CarBrandPickerField
                label={tr("common.car_brand")}
                control={form.control}
                name={"car_brand_id"}
                placeholder="Select car brand"
                // emptyPlaceholder="No Car Brand found"
              />
              <TextField label="Model" control={form.control} name={"name"} />
              <VehicleCategoryPickerField
                label={tr("common.vehicleCaterory")}
                control={form.control}
                name={"vehicle_category_id"}
                placeholder="Select Vehicle category"
              />
              <Field orientation={"horizontal"}>
                <TextField
                  label="Consumption Rate"
                  control={form.control}
                  name={"consumption_rate"}
                />
                <YearPickerField
                  required={false}
                  label="Year"
                  control={form.control}
                  name={"manufacture_year"}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="sm:justify-end">
            <SubmitButton
              text={"Create Car model"}
              isSubmitting={form.formState.isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
