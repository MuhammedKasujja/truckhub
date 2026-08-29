import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shipment } from "../types"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  RecordShipmentDetailsInput,
  recordShipmentDetailsSchema,
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRecordShipmentDetails } from "../hooks/use-shipment-actions"
import {
  MoneyField,
  NumberField,
  TextareaField,
} from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { useEffect } from "react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Decimal from "@/lib/decimal-config"

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
  const { saveShipmentDetails, isPending } = useRecordShipmentDetails()

  const form = useForm<RecordShipmentDetailsInput>({
    resolver: zodResolver(recordShipmentDetailsSchema),
    defaultValues: {
      unitId: shipment?.id,
      startMileage: Number(shipment?.consumption?.start_mileage),
      endMileage: shipment?.consumption?.end_mileage,
      vehicleConsumptionRate: shipment?.vehicle?.fuel_consumption_rate ?? "0",
      consumedFuelRates: [{ value: "0" }],
      actualFuelConsumed: "0",
    },
    reValidateMode: "onChange",
  })

  const startMileage = form.watch("startMileage")
  const endMileage = form.watch("endMileage")
  const fuelRate = form.watch("fuelRate")
  const litresConsumed = form.watch("fuelUsedLitres")

  const fuelConsumptionRatesFields = useFieldArray({
    control: form.control,
    name: "consumedFuelRates",
  })

  const fuelConsumptionRates = form.watch("consumedFuelRates")

  useEffect(() => {
    if (startMileage > endMileage) {
      form.setError("endMileage", {
        message: "Invalid end mileage",
      })
    } else {
      // form.clearErrors()
      const distance = Number(endMileage - startMileage)
      form.setValue("distanceKm", distance)
      const consumptionRate = form.getValues("vehicleConsumptionRate")
      const litresUsed = new Decimal(distance).div(consumptionRate)
      form.setValue("fuelUsedLitres", litresUsed.toFixed(2))
    }
  }, [startMileage, endMileage])

  useEffect(() => {
    const consumedFuel = new Decimal(fuelRate ?? 0).times(litresConsumed ?? 0)
    form.setValue("actualFuelConsumed", consumedFuel.toFixed(2))
  }, [fuelRate, litresConsumed])

  useEffect(() => {
    const validFuelRates = fuelConsumptionRates.filter(
      (rate) => rate.value != null
    )
    const rates = validFuelRates.reduce(
      (curr, rate) => curr.plus(new Decimal(rate.value?.toString() ?? 0)),
      new Decimal(0)
    )
    const averageFuelRate = rates.dividedBy(validFuelRates.length)

    form.setValue("fuelRate", averageFuelRate.toString())
  }, [fuelConsumptionRates])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(saveShipmentDetails, (errors) => {
            console.log(errors.consumedFuelRates)
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
                name="startMileage"
                control={form.control}
              />
              <NumberField
                required={false}
                label="End Mileage"
                name="endMileage"
                control={form.control}
              />
            </Field>
            <NumberField
              readOnly
              required={false}
              label="Distance (km)"
              name="distanceKm"
              control={form.control}
            />

            <Field orientation={"horizontal"}>
              <NumberField
                readOnly
                required={false}
                label="Vehicle Consumption Rate (km/l)"
                name="vehicleConsumptionRate"
                control={form.control}
              />
              <NumberField
                readOnly
                required={false}
                label="Litres consumed"
                name="fuelUsedLitres"
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
                  onClick={() => fuelConsumptionRatesFields.append({})}
                >
                  <PlusIcon />
                </Button>
              </FieldLabel>
              {fuelConsumptionRatesFields.fields.map((ele, index) => (
                <Field key={ele.id} orientation={"horizontal"}>
                  <Controller
                    control={form.control}
                    name={`consumedFuelRates.${index}.value`}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        type={"number"}
                        inputMode="decimal"
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        value={field.value}
                        autoComplete="off"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            fuelConsumptionRatesFields.append({})
                          }
                        }}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                      />
                    )}
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
            <MoneyField
              readOnly
              required={false}
              label="Fuel Rate"
              name="fuelRate"
              control={form.control}
            />
            <MoneyField
              readOnly
              required={false}
              label="Actual Fuel Consumed"
              name="actualFuelConsumed"
              control={form.control}
            />

            <TextareaField
              label="Notes"
              name="notes"
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
