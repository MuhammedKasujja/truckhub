import { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { GripVertical, ListChecks, Plus, Settings2, Trash2 } from "lucide-react"
import { vehicleFeatureFormSchema } from "../schemas"
import { bulkUpertVehicleFeaturesFn } from "../services"
import type z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import {
  SectionEmpty,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"

type FormValues = z.infer<typeof vehicleFeatureFormSchema>

/**
 * Dialog for adding, renaming, removing and reordering the vehicle features
 * (air conditioning, GPS tracker, …) that can be ticked on a vehicle.
 */
export function EditVehicleFeatureForm({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { data } = useVehicleConfigurations()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("config:vehicle_features:edit")
  const queryInvalidator = useQueryInvalidator()

  const savedFeatures = () =>
    (data?.features ?? []).map(({ id, name }) => ({ id, name }))

  const form = useForm<FormValues>({
    resolver: zodResolver(vehicleFeatureFormSchema),
    defaultValues: { features: savedFeatures() },
  })

  // `fields[i].id` is react-hook-form's row key; the saved feature id stays
  // in the form values, and new rows are sent without one.
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "features",
  })

  function handleOpenChange(next: boolean) {
    if (next) form.reset({ features: savedFeatures() })
    setOpen(next)
  }

  function addFeature() {
    append({ name: "" }, { shouldFocus: true })
  }

  async function onSubmit(values: FormValues) {
    const { message, error } = await bulkUpertVehicleFeaturesFn({
      data: { features: values.features.filter((f) => f.name.trim()) },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(message)
    queryInvalidator.settings.vehicleConfig()
    setOpen(false)
  }

  const rootError = form.formState.errors.features?.root ?? form.formState.errors.features

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <Settings2 />
            Manage
          </Button>
        )
      }
      icon={ListChecks}
      eyebrow="Vehicle configuration"
      title="Vehicle features"
      description="Options you can tick when registering a vehicle, in the order they are listed."
      submitDisabled={!canEdit}
      isSubmitting={form.formState.isSubmitting}
      footerNote={formatPlural(fields.length, {
        singular: "feature",
        plural: "features",
      })}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {fields.length === 0 ? (
        <SectionEmpty
          icon={ListChecks}
          title="No features yet"
          description="Add features like air conditioning or a GPS tracker."
          action={
            canEdit && (
              <Button type="button" size="sm" onClick={addFeature}>
                <Plus />
                Add a feature
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <Sortable
            value={fields}
            getItemValue={(item) => item.id}
            onMove={({ activeIndex, overIndex }) =>
              move(activeIndex, overIndex)
            }
          >
            <SortableContent className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  value={field.id}
                  className="flex items-start gap-2 rounded-lg border bg-background p-2 shadow-xs"
                >
                  <SortableItemHandle asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={!canEdit}
                      className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical />
                    </Button>
                  </SortableItemHandle>
                  <Controller
                    control={form.control}
                    name={`features.${index}.name`}
                    render={({ field: input, fieldState }) => (
                      <div className="min-w-0 flex-1 space-y-1">
                        <Input
                          {...input}
                          readOnly={!canEdit}
                          aria-label={`Feature ${index + 1}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="e.g. Air conditioning"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              if (canEdit && index === fields.length - 1)
                                addFeature()
                            }
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  {canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mt-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove feature ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </SortableItem>
              ))}
            </SortableContent>
          </Sortable>

          {canEdit && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={addFeature}
            >
              <Plus />
              Add a feature
            </Button>
          )}
        </div>
      )}
      {rootError?.message && (
        <p className="text-xs text-destructive">{rootError.message}</p>
      )}
    </SettingsFormDialog>
  )
}
