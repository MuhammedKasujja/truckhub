import { Field, FieldError } from "@/components/ui/field"
import {
  TonnagePricingRequest,
  TruckBookingRequest,
} from "@/features/bookings/schemas"
import { Control, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/format"

type Props = {
  control: Control<TruckBookingRequest>
  routeIndex: number
  pricingIndex: number
  pricing: TonnagePricingRequest
  handleRemove: (routeIndex: number, pricingIndex: number) => void
}

export function TonnagePricingRow({
  control,
  routeIndex,
  pricingIndex,
  handleRemove,
  pricing,
}: Props) {
  return (
    <div
      className="flex flex-row gap-4"
      key={`${routeIndex}_${pricingIndex}_pricing`}
    >
      <Input defaultValue={pricing.min_tons} readOnly disabled />
      <Input defaultValue={pricing.max_tons} readOnly disabled />
      <Input
        defaultValue={formatMoney(pricing.default_price)}
        readOnly
        disabled
      />
      <Controller
        name={`services.${routeIndex}.pricings.${pricingIndex}.price`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              {...field}
              type={"number"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              onChange={(e) => {
                const number = e.target.valueAsNumber
                field.onChange(isNaN(number) ? null : number)
              }}
            />
            {fieldState.invalid && (
              <FieldError className="text-xs" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name={`services.${routeIndex}.pricings.${pricingIndex}.tons`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              {...field}
              type={"text"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
            />
            {fieldState.invalid && (
              <FieldError className="text-xs" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Button
        type="button"
        variant="destructive"
        size={"icon-sm"}
        onClick={() => handleRemove(routeIndex, pricingIndex)}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
