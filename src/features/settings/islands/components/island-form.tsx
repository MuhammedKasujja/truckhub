import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, XIcon } from "lucide-react"
import { IconSandbox } from "@tabler/icons-react"
import { islandCreateSchema, islandUpdateSchema } from "../schemas"
import { createIslandFn, updateIslandFn } from "../services"
import type z from "zod"
import type { Island } from "../types"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/form-fields"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"

type Props = {
  initialData?: Island
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyLocation = { value: "" }

function toFormValues(island?: Island) {
  if (!island) return { name: "", locations: [emptyLocation] }
  return {
    id: island.id,
    name: island.name,
    locations: island.locations.length
      ? island.locations.map((value) => ({ value }))
      : [emptyLocation],
  }
}

export function IslandForm({ initialData, open, onOpenChange }: Props) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const formSchema = isEdit ? islandUpdateSchema : islandCreateSchema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(initialData),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  })

  // Start from the saved values each time the dialog opens.
  React.useEffect(() => {
    if (open) form.reset(toFormValues(initialData))
  }, [open])

  /** Enter moves down the list, adding a row after the last one if it's filled. */
  function handleLocationEnter(
    event: React.KeyboardEvent<HTMLLIElement>,
    index: number
  ) {
    if (event.key !== "Enter") return
    event.preventDefault()
    if (index < fields.length - 1) {
      form.setFocus(`locations.${index + 1}.value`)
    } else if (form.getValues(`locations.${index}.value`)?.trim()) {
      append(emptyLocation)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateIslandFn({ data: values })
        : await createIslandFn({ data: values })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.islands.list()
      onOpenChange(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={IconSandbox}
      eyebrow={isEdit ? "Edit island" : "New island"}
      title={isEdit ? initialData.name : "Add an island"}
      description="An island and the places on it."
      size="sm"
      submitText={isEdit ? "Save changes" : "Add island"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
      footerNote={formatPlural(fields.length, {
        singular: "location",
        plural: "locations",
      })}
    >
      <TextField
        label="Name"
        control={form.control}
        name="name"
        placeholder="e.g. Bugala"
      />

      <FormGroup
        title="Locations"
        description="Press Enter to add another."
      >
        <ol className="overflow-hidden rounded-lg border [&_input]:bg-background">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="flex items-start gap-2 p-1.5 even:bg-muted/60"
              onKeyDown={(event) => handleLocationEnter(event, index)}
            >
              <span
                aria-hidden
                className="flex h-8 w-5 shrink-0 items-center justify-end text-xs text-muted-foreground tabular-nums"
              >
                {index + 1}
              </span>
              <label htmlFor={`locations.${index}.value`} className="sr-only">
                Location {index + 1}
              </label>
              <div className="min-w-0 flex-1">
                <TextField
                  control={form.control}
                  name={`locations.${index}.value`}
                  placeholder="e.g. Kalangala"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove location ${index + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => append(emptyLocation)}
        >
          <Plus />
          Add location
        </Button>
      </FormGroup>
    </SettingsFormDialog>
  )
}
