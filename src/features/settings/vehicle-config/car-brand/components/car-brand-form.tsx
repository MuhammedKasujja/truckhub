import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CarFront } from "lucide-react"
import type z from "zod"
import type { CarBrandUpdateSchemaType } from "@/features/settings/vehicle-config/car-brand/schemas"
import {
  CarBrandCreateSchema,
  CarBrandUpdateSchema,
} from "@/features/settings/vehicle-config/car-brand/schemas"
import {
  createCarBrandFn,
  updateCarBrandFn,
} from "@/features/settings/vehicle-config/car-brand/services"
import { TextField } from "@/components/ui/form-fields"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { SettingsFormDialog } from "@/features/settings/_components/settings-ui"

type Props = {
  initialData?: CarBrandUpdateSchemaType
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyValues = { name: "" }

export function CarBrandForm({ initialData, open, onOpenChange }: Props) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const formSchema = isEdit ? CarBrandUpdateSchema : CarBrandCreateSchema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? emptyValues,
  })

  // Start from the saved values each time the dialog opens.
  React.useEffect(() => {
    if (open) form.reset(initialData ?? emptyValues)
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateCarBrandFn({ data: values })
        : await createCarBrandFn({ data: values })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.carBrands.list()
      onOpenChange(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CarFront}
      eyebrow={isEdit ? "Edit car make" : "New car make"}
      title={isEdit ? (initialData.name ?? "Car make") : "Add a car make"}
      description="The manufacturer, e.g. Isuzu or Toyota. Add its models on the Car models tab."
      size="sm"
      submitText={isEdit ? "Save changes" : "Add make"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <TextField
        label="Name"
        control={form.control}
        name="name"
        placeholder="e.g. Isuzu"
      />
    </SettingsFormDialog>
  )
}
