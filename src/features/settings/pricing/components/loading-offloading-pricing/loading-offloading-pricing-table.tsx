import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import {
  LoadingOffloadingPricingRequest,
  LoadingOffloadingPricingSchema,
} from "../../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { DatePicker, MoneyField, TextField } from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"

interface Props {
  pricings?: LoadingOffloadingPricingRequest
}

export function LoadingOffloadingPricingTable({ pricings }: Props) {
  const form = useForm<z.infer<typeof LoadingOffloadingPricingSchema>>({
    resolver: zodResolver(LoadingOffloadingPricingSchema),
    defaultValues: {
      client_id: pricings?.client_id,
      effective_date: pricings?.effective_date,
      pricings: pricings?.pricings,
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  // Tonnage  Ranges should not overlap
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <div className="w-full space-y-2.5 md:w-80">
            <Label>Effective Date</Label>
            <DatePicker
              initialDate={pricings?.effective_date}
              onDateChanged={() => {}}
            />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-7 border-t border-b py-4">
        <FieldGroup className="space-y-1">
          <Field orientation={"horizontal"} className="grid grid-cols-6">
            <div>TONS Min</div>
            <div>TONS Max</div>
            <div>CBM Min</div>
            <div>CBM Max</div>
            <div>Loading fees</div>
            <div>Offloading fees</div>
            <div></div>
          </Field>
          {fields.map((ele, index) => (
            <Field key={ele.id} orientation={"horizontal"}>
              <TextField
                readOnly
                control={form.control}
                name={`pricings.${index}.tonnage_min`}
              />
              <TextField
                readOnly
                control={form.control}
                name={`pricings.${index}.tonnage_max`}
              />
              <TextField
                readOnly
                control={form.control}
                name={`pricings.${index}.cbm_min`}
              />
              <TextField
                readOnly
                control={form.control}
                name={`pricings.${index}.cbm_max`}
              />
              <MoneyField
                readOnly
                control={form.control}
                name={`pricings.${index}.loading_fees`}
              />
              <MoneyField
                readOnly
                control={form.control}
                name={`pricings.${index}.offloading_fees`}
              />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
