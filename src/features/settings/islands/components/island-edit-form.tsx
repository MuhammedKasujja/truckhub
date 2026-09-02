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

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusIcon, Trash2 } from "lucide-react"
import z from "zod"
import { TextField } from "@/components/ui/form-fields"
import React from "react"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  islandCreateSchema,
  islandUpdateSchema,
  IslandUpdateSchemaType,
} from "../schemas"
import { createIslandFn, updateIslandFn } from "../services"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"

type Props = {
  trigger?: React.ReactNode
  initialData?: IslandUpdateSchemaType
}

export function IslandEditForm({ trigger, initialData }: Props) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  const [open, setOpen] = React.useState(false)
  const isEdit = !!initialData

  const formSchema = isEdit ? islandUpdateSchema : islandCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { ...initialData } : { locations: [] },
  })

  const locationFields = useFieldArray({
    control: form.control,
    name: "locations",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateIslandFn({ data: values })
        : createIslandFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      form.reset()
      queryInvalidator.islands.list()
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
            Island
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Island details" : "Add Island details"}
            </DialogTitle>
            <DialogDescription>Create island</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
              <Label htmlFor={`location`}>
                Locations {locationFields.fields.length}
              </Label>
              {locationFields.fields.map((field, locationIndex) => (
                <Field key={field.id} orientation={"horizontal"}>
                  <TextField
                    control={form.control}
                    name={`locations.${locationIndex}.value`}
                  />
                  {locationFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant={"destructive"}
                      size={"icon-sm"}
                      onClick={() => {
                        if (locationFields.fields.length > 1)
                          locationFields.remove(locationIndex)
                      }}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </Field>
              ))}
              <Field>
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={() => locationFields.append({ value: "" })}
                >
                  Add Location
                </Button>
              </Field>
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
