import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { vehicleFeatureFormSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { GripVertical, Plus, Trash2, View } from "lucide-react"
import { SubmitButton } from "@/components/ui/submit-button"
import { TextField } from "@/components/ui/form-fields"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { makeId } from "../../pricing/utils/distance-tonnage-pricing-utils"
import { bulkUpertVehicleFeaturesFn } from "../services"
import { toast } from "sonner"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { Can } from "@/components/has-permission"

const emptyFeature = {
  name: "",
  id: makeId("__feature__"),
}

export function EditVehicleFeatureForm() {
  const { data } = useVehicleConfigurations()
  const form = useForm<z.infer<typeof vehicleFeatureFormSchema>>({
    resolver: zodResolver(vehicleFeatureFormSchema),
    defaultValues: {
      features: data?.features ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  })

  async function onSubmitData(data: z.infer<typeof vehicleFeatureFormSchema>) {
    const { message, error } = await bulkUpertVehicleFeaturesFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(message)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <View /> Features
        </Button>
      </DialogTrigger>
      <DialogContent className="ring-4 md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Vehicle Features</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmitData)}>
          <FieldGroup className="space-y-1">
            <Sortable
              value={fields}
              onValueChange={(updated) =>
                form.setValue("features", updated, {
                  shouldDirty: true,
                })
              }
              getItemValue={(item) => item.name}
            >
              <SortableContent className="flex flex-col gap-4">
                {fields.map((f, index) => (
                  <SortableItem
                    key={f.id}
                    value={f.id}
                    className="flex items-center gap-2"
                  >
                    <SortableItemHandle asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-1 size-8 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>
                    <Field orientation={"horizontal"}>
                      <TextField
                        control={form.control}
                        name={`features.${index}.name`}
                      />
                      <Can permission="config:vehicle_features:edit">
                        <Button
                          type="button"
                          variant={"destructive"}
                          onClick={() => remove(index)}
                          size={"icon-sm"}
                        >
                          <Trash2 />
                        </Button>
                      </Can>
                    </Field>
                  </SortableItem>
                ))}
              </SortableContent>
            </Sortable>
            <Separator />
            <Can permission="config:vehicle_features:edit">
              <Button
                type="button"
                variant={"secondary"}
                className="mb-5"
                onClick={() => append(emptyFeature)}
              >
                <Plus /> Add
              </Button>
            </Can>
          </FieldGroup>
          <Can permission="config:vehicle_features:edit">
            <DialogFooter>
            <Field>
              <SubmitButton isSubmitting={form.formState.isSubmitting} />
            </Field>
          </DialogFooter>
          </Can>
        </form>
      </DialogContent>
    </Dialog>
  )
}
