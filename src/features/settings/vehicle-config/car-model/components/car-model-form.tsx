import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Car } from "lucide-react"
import { useCreateCarModel, useEditCarModel } from "../../hooks/use-car-model"
import type z from "zod"
import type { CarModel } from "../types"
import {
  CarModelCreateSchema,
  CarModelUpdateSchema,
} from "@/features/settings/vehicle-config/car-model/schemas"
import {
  ImageField,
  TextField,
  YearPickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import { CarBrandPickerField } from "@/features/settings/vehicle-config/car-brand/components"
import { VehicleCategoryPickerField } from "@/features/settings/vehicle-config/vehicle-categories/components"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type CarModelFormProps = {
  /** The model to edit; omit to create one. */
  model?: CarModel
  /** Pre-select a make when creating. */
  defaultBrandId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CarModelForm({
  model,
  defaultBrandId,
  open,
  onOpenChange,
}: CarModelFormProps) {
  const tr = useTranslation()
  const isEdit = !!model
  const create = useCreateCarModel()
  const edit = useEditCarModel()

  const formSchema = isEdit ? CarModelUpdateSchema : CarModelCreateSchema
  type Values = z.infer<typeof formSchema>

  const initialValues = (): Partial<Values> =>
    model
      ? {
          ...model,
          consumption_rate: model.consumption_rate ?? "",
          manufacture_year: model.manufacture_year ?? null,
        }
      : { name: "", consumption_rate: "", car_brand_id: defaultBrandId }

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues(),
  })

  React.useEffect(() => {
    if (open) form.reset(initialValues())
  }, [open])

  async function handleSubmit(values: Values) {
    try {
      if (isEdit) {
        await edit.mutateAsync(CarModelUpdateSchema.parse(values))
      } else {
        await create.mutateAsync(CarModelCreateSchema.parse(values))
      }
      onOpenChange(false)
    } catch {
      // The hooks show the error toast; keep the dialog open to fix it.
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Car}
      eyebrow={isEdit ? "Edit car model" : "New car model"}
      title={
        model ? `${model.car_brand.name} ${model.name}` : "Add a car model"
      }
      description="Models are what you pick when registering a vehicle or pricing a service."
      size="lg"
      submitText={isEdit ? "Save changes" : "Add model"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <FormGroup
          title="Photo"
          description="Optional. A side view on a plain background works best."
        >
          <ImageField
            control={form.control}
            name="image"
            aspect={16 / 9}
            src={model?.image_url ?? undefined}
            width="full"
          />
        </FormGroup>

        <div className="space-y-6">
          <FormGroup title="Model">
            <CarBrandPickerField
              label={tr("common.car_brand")}
              control={form.control}
              name="car_brand_id"
              placeholder="Select a make"
            />
            <TextField
              label="Model name"
              control={form.control}
              name="name"
              placeholder="e.g. FVR"
            />
            <VehicleCategoryPickerField
              label={tr("common.vehicleCaterory")}
              control={form.control}
              name="vehicle_category_id"
              placeholder="Select a category"
            />
          </FormGroup>

          <FormGroup title="Specs">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Fuel consumption (km/l)"
                control={form.control}
                name="consumption_rate"
                placeholder="e.g. 6.5"
              />
              <YearPickerField
                required={false}
                label="Year"
                control={form.control}
                name="manufacture_year"
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </SettingsFormDialog>
  )
}
