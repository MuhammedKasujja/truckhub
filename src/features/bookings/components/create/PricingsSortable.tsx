import { useBookingFormActions } from "./actions"
import { EntityId } from "@/schemas"
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form"
import { RoutePricingStruct, TruckBookingRequest } from "../../schemas"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatNumber } from "@/lib/format"

type Props = {
  serviceId: EntityId
  routeId: EntityId
  route: RoutePricingStruct
  control: Control<TruckBookingRequest>
  getValues: UseFormGetValues<TruckBookingRequest>
  setValue: UseFormSetValue<TruckBookingRequest>
}

export function PricingsSortable({
  serviceId,
  routeId,
  route,
  getValues,
  setValue,
  control,
}: Props) {
  const {} = useBookingFormActions(getValues, setValue)

  const services = getValues("services")

  const serviceIndex = services.findIndex((s) => s.tempId === serviceId)

  const routeIndex = services[serviceIndex].routes.findIndex(
    (r) => r.route_id === routeId
  )

  // const onChangeField = (
  //   pricingId: string,
  //   patch: Partial<{
  //     tons: string
  //     price: string | number
  //   }>
  // ) => {
  //   updatePricingField({
  //     serviceId,
  //     routeId,
  //     pricingId,
  //     patch,
  //   })
  // }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 flex-col">
        <div>{route.destination}</div>

        <div className="text-sm text-muted-foreground">
          {formatNumber(route.min_hrs)} - {formatNumber(route.max_hrs)} hrs |{" "}
          {formatNumber(route.distance_km)} km
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Controller
          name={`services.${serviceIndex}.routes.${routeIndex}.pricing.price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div>Price</div>
              <Input
                {...field}
                type={"text"}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError
                  className="text-[10px]"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name={`services.${serviceIndex}.routes.${routeIndex}.pricing.tons`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div>
                Tons{" "}
                <span className="text-[10px] text-muted-foreground">
                  ({route.pricing.min_tons}-{route.pricing.max_tons})
                </span>
              </div>
              <Input
                {...field}
                type={"text"}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError
                  className="text-[10px]"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </div>
    </div>
  )
}
