import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { LoadingOffloadingPricingSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { TextField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { Separator } from "@/components/ui/separator"
import { createBatchLoadingPricingFn } from "../services"
import { toast } from "sonner"

const emptyPricing = {
  tonnage_min: "",
  tonnage_max: "",
  price: "",
  cbm_min: "",
  cbm_max: "",
  loading_fees: "",
  offloading_fees: "",
}

export function LoadingOffloadingPricingForm() {
  const form = useForm<z.infer<typeof LoadingOffloadingPricingSchema>>({
    resolver: zodResolver(LoadingOffloadingPricingSchema),
    defaultValues: {
      pricings: [emptyPricing],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  async function onSubmit(
    data: z.infer<typeof LoadingOffloadingPricingSchema>
  ) {
    const { message, error } = await createBatchLoadingPricingFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(message)
    }
  }

  // Tonnage  Ranges should not overlap
  return (
    <Card>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            {fields.map((ele, index) => (
              <Field key={ele.id} orientation={"horizontal"}>
                <TextField
                  control={form.control}
                  name={`pricings.${index}.tonnage_min`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.tonnage_max`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.cbm_min`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.cbm_max`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.loading_fees`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.offloading_fees`}
                />
                <TextField
                  control={form.control}
                  name={`pricings.${index}.price`}
                />
              </Field>
            ))}
            <Separator />
            <Button
              type="button"
              variant={"outline"}
              className="mb-5"
              onClick={() => append(emptyPricing)}
            >
              <Plus /> Add
            </Button>
          </FieldGroup>
          <SubmitButton isSubmitting={form.formState.isSubmitting} />
        </form>
      </CardContent>
    </Card>
  )
}
