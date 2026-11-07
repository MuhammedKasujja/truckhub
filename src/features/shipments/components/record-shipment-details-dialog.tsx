import { useEffect } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconReceiptTax } from "@tabler/icons-react"
import { Fuel, Gauge, Plus, X } from "lucide-react"
import { recordShipmentDetailsSchema } from "../schemas"
import { useRecordShipmentDetails } from "../hooks/use-shipment-actions"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
import type { RecordShipmentDetailsInput } from "../schemas"
import type { Shipment } from "../types"
import type React from "react"
import { TextField, TextareaField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Decimal from "@/lib/decimal-config"
import { formatMoney } from "@/lib/format"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

const safeDecimal = (value: unknown) => {
  try {
    return new Decimal(
      value === undefined || value === null || value === "" ? 0 : String(value)
    )
  } catch {
    return new Decimal(0)
  }
}

// Digits with at most one decimal point and two decimal places
const sanitizeAmount = (raw: string) => {
  const cleaned = raw.replace(/[^0-9.]/g, "")
  const [whole, ...rest] = cleaned.split(".")
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole
}

function defaultsFor(shipment?: Shipment): RecordShipmentDetailsInput {
  const consumption = shipment?.consumption
  const rates = consumption?.consumed_fuel_rates ?? []
  return {
    unitId: shipment?.id as RecordShipmentDetailsInput["unitId"],
    startMileage: consumption?.start_mileage ?? "",
    endMileage: consumption?.end_mileage ?? "",
    distanceKm: consumption?.distance_km ?? "",
    vehicleConsumptionRate: shipment?.vehicle?.fuel_consumption_rate ?? "0",
    consumedFuelRates: rates.length
      ? rates.map((value) => ({ value }))
      : [{ value: undefined }],
    actualFuelConsumed: "0",
    notes: "",
  }
}

export function RecordShipmentDetailsDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { saveShipmentDetails, isPending } = useRecordShipmentDetails()

  const form = useForm<RecordShipmentDetailsInput>({
    resolver: zodResolver(recordShipmentDetailsSchema),
    defaultValues: defaultsFor(shipment),
    reValidateMode: "onChange",
  })

  useEffect(() => {
    if (open) form.reset(defaultsFor(shipment))
  }, [form, open, shipment])

  const rateFields = useFieldArray({
    control: form.control,
    name: "consumedFuelRates",
  })

  const startMileage = useWatch({ control: form.control, name: "startMileage" })
  const endMileage = useWatch({ control: form.control, name: "endMileage" })
  const consumptionRate = useWatch({
    control: form.control,
    name: "vehicleConsumptionRate",
  })
  const fuelRates = useWatch({
    control: form.control,
    name: "consumedFuelRates",
  })
  const litres = useWatch({ control: form.control, name: "fuelUsedLitres" })
  const avgRate = useWatch({ control: form.control, name: "fuelRate" })
  const fuelCharge = useWatch({
    control: form.control,
    name: "actualFuelConsumed",
  })

  // Distance and litres used from the odometer readings
  useEffect(() => {
    const start = safeDecimal(startMileage)
    const end = safeDecimal(endMileage)
    if (!endMileage) return
    if (start.greaterThan(end)) {
      form.setError("endMileage", {
        message: "Must be higher than the start reading",
      })
      return
    }
    form.clearErrors("endMileage")
    const distance = end.minus(start)
    form.setValue("distanceKm", distance.toFixed())
    const rate = safeDecimal(consumptionRate)
    form.setValue(
      "fuelUsedLitres",
      rate.greaterThan(0) ? distance.div(rate).toFixed(2) : "0"
    )
  }, [form, startMileage, endMileage, consumptionRate])

  // Average fuel price across the receipts entered
  useEffect(() => {
    const valid = fuelRates.filter((r) => r.value && safeDecimal(r.value).gt(0))
    const avg = valid.length
      ? valid
          .reduce((sum, r) => sum.plus(safeDecimal(r.value)), new Decimal(0))
          .div(valid.length)
          .toFixed(2)
      : "0"
    form.setValue("fuelRate", avg)
  }, [form, fuelRates])

  // Fuel charge = litres × average price
  useEffect(() => {
    form.setValue(
      "actualFuelConsumed",
      safeDecimal(avgRate).times(safeDecimal(litres)).toFixed(2)
    )
  }, [form, avgRate, litres])

  const distance = useWatch({ control: form.control, name: "distanceKm" })

  return (
    <ShipmentActionDialog
      open={open && !!shipment}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={IconReceiptTax}
      title="Capture trip details"
      description="Odometer and fuel figures used to bill this trip."
      formId="shipment-details"
      submitLabel="Save details"
      isSubmitting={isPending}
      className="sm:max-w-lg"
    >
      <form
        id="shipment-details"
        className="space-y-6"
        onSubmit={form.handleSubmit((values) =>
          closeOnSuccess(
            () =>
              saveShipmentDetails({
                ...values,
                consumedFuelRates: values.consumedFuelRates.filter(
                  (r) => !!r.value
                ),
              }),
            () => onOpenChange(false)
          )
        )}
      >
        {/* Odometer */}
        <section className="space-y-3">
          <SectionTitle icon={Gauge}>Odometer</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              readOnly
              required={false}
              label="Start (km)"
              name="startMileage"
              control={form.control}
            />
            <TextField
              label="End (km)"
              name="endMileage"
              control={form.control}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Distance travelled</span>
            <span className="font-medium tabular-nums">
              {distance ? `${distance} km` : "—"}
            </span>
          </div>
        </section>

        {/* Fuel */}
        <section className="space-y-3">
          <SectionTitle icon={Fuel}>Fuel</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              readOnly
              required={false}
              label="Vehicle economy (km/L)"
              name="vehicleConsumptionRate"
              control={form.control}
            />
            <TextField
              readOnly
              required={false}
              label="Litres used"
              name="fuelUsedLitres"
              control={form.control}
            />
          </div>

          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Fuel price per litre</p>
                <p className="text-xs text-muted-foreground">
                  Add one price per fill-up; the average is billed.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => rateFields.append({ value: undefined })}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
            {rateFields.fields.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">
                  {index + 1}.
                </span>
                <Controller
                  control={form.control}
                  name={`consumedFuelRates.${index}.value`}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      inputMode="decimal"
                      placeholder="Price per litre"
                      aria-label={`Fuel price ${index + 1}`}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          rateFields.append({ value: undefined })
                        }
                      }}
                      onChange={(e) =>
                        field.onChange(
                          sanitizeAmount(e.target.value) || undefined
                        )
                      }
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={rateFields.fields.length === 1}
                  onClick={() => rateFields.remove(index)}
                  aria-label={`Remove fuel price ${index + 1}`}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Result */}
        <dl className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Average price</dt>
            <dd className="tabular-nums">{formatMoney(avgRate ?? 0)} / L</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Litres used</dt>
            <dd className="tabular-nums">{litres ?? "0"} L</dd>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <dt className="font-medium">Fuel charge</dt>
            <dd className="text-base font-semibold text-primary tabular-nums">
              {formatMoney(fuelCharge)}
            </dd>
          </div>
        </dl>

        <TextareaField
          label="Notes"
          name="notes"
          control={form.control}
          required={false}
          placeholder="Anything worth noting about this trip (optional)"
        />
      </form>
    </ShipmentActionDialog>
  )
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium">
      <Icon className="size-4 text-muted-foreground" />
      {children}
    </h3>
  )
}
