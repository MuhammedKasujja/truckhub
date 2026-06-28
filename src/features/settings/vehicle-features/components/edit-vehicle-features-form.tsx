import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { vehicleFeatureFormSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, View } from "lucide-react"
import { SubmitButton } from "@/components/ui/submit-button"
import { TextField } from "@/components/ui/form-fields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { makeId } from "../../pricing/utils/distance-tonnage-pricing-utils"
import { bulkUpertVehicleFeaturesFn } from "../services"
import { toast } from "sonner"

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
      <DialogContent className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Vehicle Features</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmitData)}>
          <FieldGroup className="space-y-1">
            {fields.map((ele, index) => (
              <Field key={ele.id} orientation={"horizontal"}>
                <TextField
                  control={form.control}
                  name={`features.${index}.name`}
                />
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => remove(index)}
                  size={"icon-sm"}
                >
                  <Trash2 />
                </Button>
              </Field>
            ))}
            <Separator />
            <Button
              type="button"
              variant={"secondary"}
              className="mb-5"
              onClick={() => append(emptyFeature)}
            >
              <Plus /> Add
            </Button>
          </FieldGroup>
          <Field className="">
            <SubmitButton isSubmitting={form.formState.isSubmitting} />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  )
}
