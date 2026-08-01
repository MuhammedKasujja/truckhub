"use client"
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
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import z from "zod"
import {
  CarModelCreateSchema,
  CarModelUpdateSchemaType,
  CarModelUpdateSchema,
} from "@/features/settings/car-model/schemas"
import {
  createCarModelFn,
  updateCarModelFn,
} from "@/features/settings/car-model/services"
import {
  AutoCompleteField,
  NumberField,
  TextField,
} from "@/components/ui/form-fields"
import React from "react"
import { FieldGroup } from "@/components/ui/field"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"

type CarModelFormProps = {
  trigger?: React.ReactNode
  initialData?: CarModelUpdateSchemaType
}

export function CarModelForm({ trigger, initialData }: CarModelFormProps) {
  const { data } = useVehicleConfigurations()

  const queryInvalidator = useQueryInvalidator()
  const tr = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isEdit = !!initialData

  const formSchema = isEdit ? CarModelUpdateSchema : CarModelCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateCarModelFn({ data: values })
        : createCarModelFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      form.reset()
      queryInvalidator.settings.carModels.list()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="font-normal">
            <PlusIcon />
            Car Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant={"outline"} size={"icon"} type="button">
                <PlusIcon />
              </Button>
              Car Model
            </DialogTitle>
            <DialogDescription>Create new car model</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <AutoCompleteField
              label={tr("common.car_brand")}
              control={form.control}
              name={"car_brand_id"}
              placeholder="Select Car Brand"
              emptyPlaceholder="No Car Brand found"
              options={
                data?.car_brands.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                })) ?? []
              }
            />
            <TextField label="Model" control={form.control} name={"name"} />
            <AutoCompleteField
              label={tr("common.vehicle_type")}
              control={form.control}
              name={"vehicle_category_id"}
              placeholder="Select Vehicle type"
              emptyPlaceholder="No Vehicle type found"
              options={
                data?.vehicle_types.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                })) ?? []
              }
            />
            <NumberField
              label="Consumption Rate"
              control={form.control}
              name={"consumption_rate"}
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
  )
}
