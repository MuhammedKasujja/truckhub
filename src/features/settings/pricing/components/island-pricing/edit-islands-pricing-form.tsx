import { Control, useFieldArray, useForm, useWatch } from "react-hook-form"
import {
  IslandsListPricingRequest,
  IslandsListPricingSchema,
} from "../../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DatePickerField,
  MoneyField,
  TextField,
} from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { SubmitButton } from "@/components/ui/submit-button"
import { Plus, XIcon } from "lucide-react"
import { IslandSelectorField } from "@/features/settings/islands/components"
import { useEffect } from "react"

const emptyIslandPricing = {
  island_id: "",
  locations: [{ value: "" }],
  priceRate: "",
  newPriceRate: null,
}

interface EditIslandsPricingProp {
  initialData?: IslandsListPricingRequest
  onSubmit: (data: IslandsListPricingRequest) => Promise<void>
  onCancel?: () => void
}

export function EditIslandsPricingForm({
  onSubmit,
  initialData,
  onCancel,
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
    <form
      onSubmit={form.handleSubmit(onSubmitData, (errors) => {
        console.error("IslandPricingForm errors", errors)
      })}
    >
      <div className="mb-4 flex flex-row items-baseline-last justify-between gap-4">
        <div className="min-w-40">
          <DatePickerField
            control={form.control}
            name="validFromDate"
            label="Effective Date"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={'secondary'}
            onClick={() => pricingFields.prepend(emptyIslandPricing)}
          >
            <Plus />
            Add Island
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant={"outline"}
              className="mr-2"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5">
          {pricingFields.fields.map((pricing, pricingIndex) => (
            <Card key={pricing.id}>
              <CardHeader>
                <CardAction>
                  <Button
                    size={"icon-xs"}
                    type="button"
                    variant={"destructive"}
                    onClick={() => pricingFields.remove(pricingIndex)}
                  >
                    <XIcon className="size-3" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Field orientation={"horizontal"} className="gap-4">
                  <IslandSelectorField
                    label="Island"
                    control={form.control}
                    name={`pricings.${pricingIndex}.island_id`}
                    onChange={(_) => {}}
                  />
                  <MoneyField
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
  const selectedIsland = useWatch({
    name: `pricings.${pricingIndex}.island_id`,
    control,
  })

  const { fields: locationFields } = useFieldArray({
    control,
    name: `pricings.${pricingIndex}.locations`,
  })

  useEffect(() => {}, [selectedIsland])

  return (
    <div className="mt-4 space-y-4">
      <Label htmlFor={`pricings.${pricingIndex}.locations.${0}.value`}>
        Locations ({locationFields.length})
      </Label>
      <div className="space-y-4">
        {locationFields.map((field, locationIndex) => (
          <Field key={field.id} orientation={"horizontal"}>
            <TextField
              readOnly
              control={control}
              name={`pricings.${pricingIndex}.locations.${locationIndex}.value`}
            />
          </Field>
        ))}
      </div>
    </div>
  )
}
