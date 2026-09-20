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
  TextareaField,
  TextField,
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
      startMileage: shipment?.consumption?.start_mileage,
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
    const newStartMileage = new Decimal(startMileage ?? 0)
    const newEndMileage = new Decimal(endMileage ?? 0)

    if (newStartMileage.greaterThan(newEndMileage)) {
      form.setError("endMileage", {
        message: "Invalid end mileage",
      })
    } else {
      // form.clearErrors()
      const distance = newEndMileage.minus(newStartMileage)
      form.setValue("distanceKm", distance.toFixed())
      const consumptionRate = form.getValues("vehicleConsumptionRate")
      const litresUsed = new Decimal(distance).div(consumptionRate)
      form.setValue("fuelUsedLitres", litresUsed.toFixed(2))
    }
  }, [startMileage, endMileage, open])

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
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden ring-4 sm:max-w-sm md:min-w-lg">
        <DialogHeader>
          <DialogTitle>Record Shipment Details</DialogTitle>
        </DialogHeader>
        <form
          id="shipment-details"
          onSubmit={form.handleSubmit(saveShipmentDetails, (errors) => {
            console.log(errors.consumedFuelRates)
          })}
          className="no-scrollbar min-h-full flex-1 space-y-4 overflow-y-auto"
        >
          <Field orientation={"horizontal"}>
            <TextField
              readOnly
              required={false}
              label="Start Mileage"
              name="startMileage"
              control={form.control}
            />
            <TextField
              required={false}
              label="End Mileage"
              name="endMileage"
              control={form.control}
            />
          </Field>
          <TextField
            readOnly
            required={false}
            label="Distance (km)"
            name="distanceKm"
            control={form.control}
          />

          <Field orientation={"horizontal"}>
            <TextField
              readOnly
              required={false}
              label="Vehicle Consumption Rate (km/l)"
              name="vehicleConsumptionRate"
              control={form.control}
            />
            <TextField
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
                        field.onChange(e.target.value.replace(/[^0-9]/g, ""))
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
        </form>
        <DialogFooter>
          <DialogClose>
            {/* <Button type="button" variant={"ghost"}> */}
            Cancle
            {/* </Button> */}
          </DialogClose>
          <SubmitButton isSubmitting={isPending} form="shipment-details" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
