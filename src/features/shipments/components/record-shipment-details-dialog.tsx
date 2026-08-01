import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shipment } from "../types"
import { useFieldArray, useForm } from "react-hook-form"
import { FinishShipmentInput, finishShipmentSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFinishShipment } from "../hooks/use-shipment-actions"
import { NumberField, TextareaField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { useEffect } from "react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function RecordShipmentDetailsDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { finishShipment, isPending } = useFinishShipment()

  const form = useForm<FinishShipmentInput>({
    resolver: zodResolver(finishShipmentSchema),
    defaultValues: {
      unitId: shipment?.id,
      start_mileage: Number(shipment?.consumption?.start_mileage),
      average_fuel_rate_per_km: Number(
        shipment?.vehicle?.fuel_consumption_rate
      ),
      consumed_fuel_rates: [{ value: null }],
    },
    reValidateMode: "onChange",
  })

  const startMileage = form.watch("start_mileage")
  const endMileage = form.watch("end_mileage")
  const fuelRate = form.watch("fuel_rate")
  const litresConsumed = form.watch("fuel_used_litres")

  const fuelConsumptionRatesFields = useFieldArray({
    control: form.control,
    name: "consumed_fuel_rates",
  })

  const fuelConsumptionRates = form.watch("consumed_fuel_rates")

  useEffect(() => {
    if (startMileage > endMileage) {
      form.setError("end_mileage", {
        message: "Invalid end mileage",
      })
    } else {
      // form.clearErrors()
      const distance = Number(endMileage - startMileage)
      form.setValue("distance_km", distance)
      const consumptionRate = form.getValues("average_fuel_rate_per_km")
      const litresUsed = distance / consumptionRate
      form.setValue("fuel_used_litres", litresUsed)
    }
  }, [startMileage, endMileage])

  useEffect(() => {
    form.setValue("actual_fuel_consumed", Number(fuelRate * litresConsumed))
  }, [fuelRate, litresConsumed])

  useEffect(() => {
    const validFuelRates = fuelConsumptionRates.filter(
      (rate) => rate.value != null
    )
    const rates = validFuelRates.reduce(
      (curr, rate) => curr + Number(rate.value),
      0
    )

    form.setValue("fuel_rate", Number(rates / validFuelRates.length))
  }, [fuelConsumptionRates])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(finishShipment, (errors) => {
            console.log(errors)
          })}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Record Shipment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field orientation={"horizontal"}>
              <NumberField
                readOnly
                required={false}
                label="Start Mileage"
                name="start_mileage"
                control={form.control}
              />
              <NumberField
                required={false}
                label="End Mileage"
                name="end_mileage"
                control={form.control}
              />
            </Field>
            <NumberField
              readOnly
              required={false}
              label="Distance (km)"
              name="distance_km"
              control={form.control}
            />

            <Field orientation={"horizontal"}>
              <NumberField
                readOnly
                required={false}
                label="Vehicle Consumption Rate (km/l)"
                name="average_fuel_rate_per_km"
                control={form.control}
              />
              <NumberField
                readOnly
                required={false}
                label="Litres consumed"
                name="fuel_used_litres"
                control={form.control}
              />
            </Field>
            <FieldGroup className="rounded-lg border border-dashed p-4">
              <FieldLabel>
                Fuel Consumptions{" "}
                <Button
                  type="button"
                  variant={"outline"}
                  size={"icon-sm"}
                  onClick={() => fuelConsumptionRatesFields.prepend({})}
                >
                  <PlusIcon />
                </Button>
              </FieldLabel>
              {fuelConsumptionRatesFields.fields.map((ele, index) => (
                <Field key={ele.id} orientation={"horizontal"}>
                  <NumberField
                    control={form.control}
                    name={`consumed_fuel_rates.${index}.value`}
                  />
                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={() => fuelConsumptionRatesFields.remove(index)}
                    size={"icon-sm"}
                  >
                    <XIcon />
                  </Button>
                </Field>
              ))}
            </FieldGroup>
            <NumberField
              readOnly
              required={false}
              label="Fuel Rate"
              name="fuel_rate"
              control={form.control}
            />
            <NumberField
              readOnly
              required={false}
              label="Actual Fuel Consumed"
              name="actual_fuel_consumed"
              control={form.control}
            />

            <TextareaField
              label="Notes"
              name="note"
              control={form.control}
              required={false}
              placeholder="optional"
            />
          </div>
          <DialogFooter>
            <DialogClose>
              {/* <Button type="button" variant={"ghost"}> */}
              Cancle
              {/* </Button> */}
            </DialogClose>
            <SubmitButton isSubmitting={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
