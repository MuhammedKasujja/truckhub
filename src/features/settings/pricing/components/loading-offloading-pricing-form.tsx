import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import {
  LoadingOffloadingPricingRequest,
  LoadingOffloadingPricingSchema,
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { TextField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { Separator } from "@/components/ui/separator"

const emptyPricingList = [
  {
    tonnage_min: "2",
    tonnage_max: "3",
    cbm_min: "6",
    cbm_max: "9",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "4",
    tonnage_max: "6",
    cbm_min: "10",
    cbm_max: "21",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "7",
    tonnage_max: "8",
    cbm_min: "22",
    cbm_max: "32",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "9",
    tonnage_max: "10",
    cbm_min: "33",
    cbm_max: "40",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "11",
    tonnage_max: "13",
    cbm_min: "41",
    cbm_max: "50",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "14",
    tonnage_max: "18",
    cbm_min: "51",
    cbm_max: "60",
    loading_fees: "",
    offloading_fees: "",
  },
  {
    tonnage_min: "19",
    tonnage_max: "25",
    cbm_min: "61",
    cbm_max: "76",
    loading_fees: "",
    offloading_fees: "",
  },
]

const emptyPricing = {
  tonnage_min: "",
  tonnage_max: "",
  cbm_min: "",
  cbm_max: "",
  loading_fees: "",
  offloading_fees: "",
}

interface LoadingOffloadingPricingSchemaProp {
  initialData?: LoadingOffloadingPricingRequest
  onSubmit: (data: LoadingOffloadingPricingRequest) => Promise<void>
}

export function LoadingOffloadingPricingForm({
  initialData,
  onSubmit,
}: LoadingOffloadingPricingSchemaProp) {
  const form = useForm<z.infer<typeof LoadingOffloadingPricingSchema>>({
    resolver: zodResolver(LoadingOffloadingPricingSchema),
    defaultValues: {
      client_id: initialData?.client_id,
      pricings: initialData?.pricings ?? emptyPricingList,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  async function onSubmitData(data: LoadingOffloadingPricingRequest) {
    await onSubmit(data)
  }

  // Tonnage  Ranges should not overlap
  return (
    <Card>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmitData)}>
          <FieldGroup className="space-y-1">
            <Field orientation={"horizontal"} className="grid grid-cols-6">
              <div>TONS Min</div>
              <div>TONS Max</div>
              <div>CBM Min</div>
              <div>CBM Max</div>
              <div>Loading fees</div>
              <div>Offloading fees</div>
            </Field>
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
          <Field className="">
            <SubmitButton isSubmitting={form.formState.isSubmitting} />
          </Field>
        </form>
      </CardContent>
    </Card>
  )
}
