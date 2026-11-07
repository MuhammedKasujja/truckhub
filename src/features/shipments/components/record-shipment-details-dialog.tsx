import { useEffect } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconReceiptTax } from "@tabler/icons-react"
import { Fuel, Gauge, NotebookPen, Plus, X } from "lucide-react"
import { recordShipmentDetailsSchema } from "../schemas"
import { useRecordShipmentDetails } from "../hooks/use-shipment-actions"
import {
  FormSection,
  OdometerReading,
  ResultBanner,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type { RecordShipmentDetailsInput } from "../schemas"
import type { Shipment } from "../types"
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

  const vehicleRate = safeDecimal(consumptionRate)

  return (
    <ShipmentActionDialog
      open={open && !!shipment}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={IconReceiptTax}
      hue="emerald"
      title="Capture trip details"
      description="Odometer and fuel figures used to bill this trip."
      formId="shipment-details"
      submitLabel="Save details"
      isSubmitting={isPending}
      className="sm:max-w-lg"
    >
      <form
        id="shipment-details"
        className="space-y-4"
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
        <FormSection icon={Gauge} hue="violet" title="Odometer">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <OdometerReading label="Start (km)" value={startMileage} />
            </div>
            <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-violet-700 tabular-nums dark:text-violet-300">
              {distance ? `${distance} km` : "— km"}
            </span>
            <div className="flex-1">
              <OdometerReading
                label="End (km)"
                value={endMileage}
                muted={!endMileage}
              />
            </div>
          </div>
          <TextField
            label="Odometer at end (km)"
            name="endMileage"
            control={form.control}
          />
        </FormSection>

        {/* Fuel */}
        <FormSection
          icon={Fuel}
          hue="amber"
          title="Fuel prices"
          description="One price per fill-up; the average is billed."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => rateFields.append({ value: undefined })}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          }
        >
          <div className="space-y-2">
            {rateFields.fields.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[11px] font-semibold text-amber-700 tabular-nums dark:text-amber-300">
                  {index + 1}
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
        </FormSection>

        {/* Result */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <dl className="grid grid-cols-3 divide-x text-center">
            <ResultStat
              label="Economy"
              value={vehicleRate.gt(0) ? `${vehicleRate.toString()} km/L` : "—"}
            />
            <ResultStat label="Litres used" value={`${litres ?? "0"} L`} />
            <ResultStat
              label="Avg. price"
              value={`${formatMoney(avgRate ?? 0)} / L`}
            />
          </dl>
          <div className="border-t p-3">
            <ResultBanner
              hue="emerald"
              label="Fuel charge"
              hint="Litres used × average price"
              value={formatMoney(fuelCharge)}
            />
          </div>
        </div>

        <FormSection icon={NotebookPen} hue="slate" title="Notes">
          <TextareaField
            name="notes"
            control={form.control}
            required={false}
            placeholder="Anything worth noting about this trip (optional)"
          />
        </FormSection>
      </form>
    </ShipmentActionDialog>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">
        {value}
      </dd>
    </div>
  )
}
