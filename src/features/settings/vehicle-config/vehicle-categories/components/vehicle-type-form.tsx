import React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Layers } from "lucide-react"
import { vehicleTypesList } from "../enums"
import { vehicleTypeMeta } from "../vehicle-type-meta"
import {
  useCreateVehicleCategory,
  useEditVehicleCategory,
} from "../../hooks/use-vehicle-category"
import { VehicleCategoryPickerField } from "./vehicle-category-pickers"
import type z from "zod"
import type { VehicleCategory } from "../types"
import type { VehicleType } from "../enums"
import {
  VehicleCategoryCreateSchema,
  VehicleCategoryUpdateSchema,
} from "@/features/settings/vehicle-config/vehicle-categories/schemas"
import { ImageField, TextField } from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  FormGroup,
  OptionTile,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type VehicleCategoryFormProps = {
  /** The category to edit; omit to create one. */
  category?: VehicleCategory
  /** Pre-select a type when creating. */
  defaultType?: VehicleType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehicleCategoryForm({
  category,
  defaultType,
  open,
  onOpenChange,
}: VehicleCategoryFormProps) {
  const tr = useTranslation()
  const isEdit = !!category
  const create = useCreateVehicleCategory()
  const edit = useEditVehicleCategory()

  const formSchema = isEdit
    ? VehicleCategoryUpdateSchema
    : VehicleCategoryCreateSchema
  type Values = z.infer<typeof formSchema>

  const initialValues = (): Partial<Values> =>
    category ? { ...category } : { name: "", type: defaultType }

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
        await edit.mutateAsync(VehicleCategoryUpdateSchema.parse(values))
      } else {
        await create.mutateAsync(VehicleCategoryCreateSchema.parse(values))
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
      icon={Layers}
      eyebrow={isEdit ? "Edit vehicle category" : "New vehicle category"}
      title={
        category ? (category.display_name ?? category.name) : "Add a vehicle category"
      }
      description="Categories group car models, like “Tipper truck” or “Minibus”."
      size="lg"
      submitText={isEdit ? "Save changes" : "Add category"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <FormGroup title="Photo" description="Optional.">
          <ImageField
            control={form.control}
            name="image"
            aspect={16 / 9}
            src={category?.image_url ?? undefined}
            width="full"
          />
        </FormGroup>

        <div className="space-y-6">
          <FormGroup title="Category">
            <TextField
              label="Name"
              control={form.control}
              name="name"
              placeholder="e.g. Tipper truck"
            />
            <VehicleCategoryPickerField
              label="Part of"
              name="parent_category_id"
              control={form.control}
              required={false}
              description="Leave empty for a main category."
            />
          </FormGroup>

          <FormGroup title="Type">
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <div
                    role="radiogroup"
                    aria-label="Vehicle type"
                    className="grid grid-cols-3 gap-2"
                  >
                    {vehicleTypesList.map((type) => (
                      <OptionTile
                        key={type}
                        selected={field.value === type}
                        onSelect={() => field.onChange(type)}
                        icon={vehicleTypeMeta[type].icon}
                        title={tr(`vehicleTypes.${type}`)}
                      />
                    ))}
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-destructive">Choose a type</p>
                  )}
                </div>
              )}
            />
          </FormGroup>
        </div>
      </div>
    </SettingsFormDialog>
  )
}
