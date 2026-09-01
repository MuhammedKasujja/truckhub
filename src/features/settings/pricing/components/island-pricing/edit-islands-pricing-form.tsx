import { Control, useFieldArray, useForm } from "react-hook-form"
import {
  IslandsListPricingRequest,
  IslandsListPricingSchema,
} from "../../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DatePickerField,
  NumberField,
  TextField,
} from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { SubmitButton } from "@/components/ui/submit-button"
import { Plus, Trash2 } from "lucide-react"

const emptyIslandPricing = {
  name: "",
  locations: [{ value: "" }],
  priceRate: 0,
  newPriceRate: null,
}

interface EditIslandsPricingProp {
  initialData?: IslandsListPricingRequest
  onSubmit: (data: IslandsListPricingRequest) => Promise<void>
}

export function EditIslandsPricingForm({
  onSubmit,
  initialData,
}: EditIslandsPricingProp) {
  const form = useForm<IslandsListPricingRequest>({
    resolver: zodResolver(IslandsListPricingSchema),
    defaultValues: {
      validFromDate: initialData?.validFromDate,
      pricings:
        initialData && initialData.pricings.length != 0
          ? initialData.pricings
          : [emptyIslandPricing],
    },
  })

  const pricingFields = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  async function onSubmitData(data: IslandsListPricingRequest) {
    await onSubmit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitData)}>
      <div className="mb-4 flex flex-row gap-4">
        {/* <div className="uppercase">Islands {pricingFields.fields.length} </div> */}
        <DatePickerField
          control={form.control}
          name="validFromDate"
          label="Valid From"
        />
        <Button
          type="button"
          variant={"outline"}
          onClick={() => pricingFields.prepend(emptyIslandPricing)}
        >
          <Plus />
          Add
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-5">
          {pricingFields.fields.map((pricing, pricingIndex) => (
            <Card key={pricing.id}>
              <CardContent>
                <Field orientation={"horizontal"} className="gap-4">
                  <TextField
                    label="Island Name"
                    control={form.control}
                    name={`pricings.${pricingIndex}.name`}
                  />
                  <NumberField
                    label="Price"
                    control={form.control}
                    name={`pricings.${pricingIndex}.priceRate`}
                  />
                </Field>
                <PricingRow
                  key={`${pricing.id}.${pricingIndex}`}
                  pricingIndex={pricingIndex}
                  control={form.control}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardFooter>
          <Field>
            <SubmitButton isSubmitting={form.formState.isSubmitting}>
              Add Location
            </SubmitButton>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}

function PricingRow({
  pricingIndex,
  control,
}: {
  pricingIndex: number
  control: Control<IslandsListPricingRequest>
}) {
  const {
    fields: locationFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `pricings.${pricingIndex}.locations`,
  })

  return (
    <div className="mt-4 space-y-4">
      <Label htmlFor={`pricings.${pricingIndex}.locations.${0}.value`}>
        Locations {locationFields.length}
      </Label>
      <div className="space-y-4">
        {locationFields.map((field, locationIndex) => (
          <Field key={field.id} orientation={"horizontal"}>
            <TextField
              control={control}
              name={`pricings.${pricingIndex}.locations.${locationIndex}.value`}
            />
            {locationFields.length > 1 && (
              <Button
                type="button"
                variant={"destructive"}
                size={"icon-sm"}
                onClick={() => {
                  if (locationFields.length > 1) remove(locationIndex)
                }}
              >
                <Trash2 />
              </Button>
            )}
          </Field>
        ))}
      </div>
      <Field>
        <Button
          type="button"
          variant={"secondary"}
          onClick={() => append({ value: "" })}
        >
          Add Location
        </Button>
      </Field>
    </div>
  )
}
