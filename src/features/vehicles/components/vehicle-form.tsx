import React, { useEffect } from "react"
import { Controller, useWatch } from "react-hook-form"
import type { Control } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"
import {
  Armchair,
  Car,
  Check,
  Cog,
  Fuel,
  Gauge,
  IdCard,
  Loader2,
  Palette,
  Sparkles,
  Weight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  AutoCompleteField,
  ColorPickerField,
  NumberField,
  PlateNumberField,
  TextField,
  YearPickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import type { VehicleUpdateSchema } from "@/features/vehicles/schemas"
import { createVehicleFn, updateVehicleFn } from "@/features/vehicles/services"
import { EngineTypes, vehicleTransmissionList } from "@/features/vehicles/types"
import { AxlesList, VehicleCylinderList } from "@/config/constants"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useVehicleConfigurationsSuspense } from "@/features/settings/hooks/use-vehicle-configurations"
import { CAR_COLOR_OPTIONS } from "@/common/config"
import type { VehicleFeature } from "@/types/setting"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { useVehicleForm } from "../hooks/use-vehicle-form"
import {
  ColorDot,
  PlateNumber,
  VehicleIconTile,
  carColor,
} from "./vehicle-visuals"

type IconType = React.ComponentType<{ className?: string }>

type VehicleFormProps = {
  initialData?: z.infer<typeof VehicleUpdateSchema>
  onCancel?: () => void
}

/** Fields the API requires; drive the completion meter. */
const REQUIRED_FIELDS = [
  "car_brand_id",
  "car_model_id",
  "year",
  "drive_train_id",
  "plate_number",
  "color",
  "engine_type",
  "gearbox",
  "cylinders",
  "tank_capacity",
  "fuel_consumption_rate",
] as const

const isFilled = (v: unknown) => v !== undefined && v !== null && v !== ""

export function VehicleForm({ initialData, onCancel }: VehicleFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()
  const { data: vehicleCofig } = useVehicleConfigurationsSuspense()
  const {
    formSchema,
    form,
    vehicleCategory,
    toggleFeatures,
    driveTrains,
    selectedFeatures,
    isEdit,
    carModels,
  } = useVehicleForm(vehicleCofig, initialData)

  // The hook's form is a union of the create/update shapes; field-level
  // helpers below only need a loosely typed control.
  const control = form.control as unknown as Control<Record<string, unknown>>
  const values = useWatch({ control }) as Record<string, unknown>

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateVehicleFn({ data: values })
        : createVehicleFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.vehicles.list.invalidate()
      if ("id" in values)
        queryInvalidator.vehicles.details(values.id).invalidate()
      form.reset()
    } else {
      toast.error(error?.message)
    }
  }

  useEffect(() => {
    form.reset(initialData)
  }, [initialData])

  const brand = vehicleCofig?.car_brands.find(
    (b) => b.id === values.car_brand_id
  )
  const model = vehicleCofig?.car_models.find(
    (m) => m.id === values.car_model_id
  )
  const driveTrain = vehicleCofig?.drive_trains.find(
    (d) => d.id === values.drive_train_id
  )
  const isTruck = !!vehicleCategory?.is_truck
  const filledCount = REQUIRED_FIELDS.filter((f) => isFilled(values[f])).length
  const progress = Math.round((filledCount / REQUIRED_FIELDS.length) * 100)
  const featureCount = selectedFeatures?.length ?? 0

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log(errors)
        toast.info("Please complete all required fields")
      })}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        {/* Make & model */}
        <FormSection
          icon={Car}
          title="Make & model"
          description="Pick the brand first to load its models."
          aside={
            vehicleCategory && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {vehicleCategory.name}
              </span>
            )
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AutoCompleteField
              label={tr("common.car_brand")}
              control={form.control}
              name={"car_brand_id"}
              placeholder="Select brand"
              emptyPlaceholder="No brand found"
              options={
                vehicleCofig?.car_brands.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                })) ?? []
              }
            />
            <AutoCompleteField
              disabled={!values.car_brand_id}
              label={tr("common.car_model")}
              control={form.control}
              name={"car_model_id"}
              placeholder={
                values.car_brand_id ? "Select model" : "Pick a brand first"
              }
              emptyPlaceholder="No model found"
              options={carModels.map((opt) => ({
                label: opt.name,
                value: opt.id,
              }))}
            />
            <YearPickerField
              label={tr("common.year")}
              name={"year"}
              placeholder="Select year"
              control={form.control}
            />
            <AutoCompleteField
              label={tr("common.drive_train")}
              control={form.control}
              name={"drive_train_id"}
              placeholder="Select drive train"
              emptyPlaceholder="No drive train found"
              options={driveTrains.map((opt) => ({
                label: opt.name,
                value: opt.id,
              }))}
            />
          </div>
        </FormSection>

        {/* Registration & colour */}
        <FormSection
          icon={IdCard}
          title="Registration & colour"
          description="Number plates and paint."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <PlateNumberField
              label={tr("plate_number")}
              name={"plate_number"}
              control={form.control}
            />
            {isTruck ? (
              <TextField
                label={"Trailer plate number"}
                name={"second_plate_number"}
                placeholder="Optional"
                control={form.control}
                required={false}
              />
            ) : (
              <div className="hidden sm:block" />
            )}
            <ColorPickerField
              label={tr("color")}
              name={"color"}
              required
              control={form.control}
              options={CAR_COLOR_OPTIONS}
            />
            <ColorPickerField
              label={tr("interior_color")}
              name={"interior_color"}
              control={form.control}
              required={false}
              options={CAR_COLOR_OPTIONS}
            />
          </div>
        </FormSection>

        {/* Engine & drivetrain */}
        <FormSection
          icon={Cog}
          title="Engine & transmission"
          description="Used for fuel estimates on quotes and trips."
          className="xl:col-span-2"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ChoiceField
              control={control}
              name="engine_type"
              label={tr("engineType")}
              options={EngineTypes.map((v) => ({
                value: v,
                label: tr(`common.${v}`),
                icon: Fuel,
              }))}
            />
            <ChoiceField
              control={control}
              name="gearbox"
              label={tr("transmission")}
              options={vehicleTransmissionList.map((v) => ({
                value: v,
                label: tr(`common.${v}`),
                icon: Cog,
              }))}
            />
            <ChoiceField
              control={control}
              name="cylinders"
              label={tr("cylinders")}
              compact
              options={VehicleCylinderList.map((v) => ({
                value: `${v}`,
                label: `${v}`,
              }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label={`${tr("engineCapacity")} (cc)`}
                name={"tank_capacity"}
                control={form.control}
              />
              <NumberField
                label={"Consumption (km/l)"}
                name={"fuel_consumption_rate"}
                control={form.control}
              />
            </div>
          </div>
        </FormSection>

        {/* Capacity */}
        <FormSection
          icon={isTruck ? Weight : Armchair}
          title="Capacity"
          description={
            isTruck
              ? "Load the truck can carry and its axles."
              : "How many passengers it seats."
          }
          className="xl:col-span-2"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ChoiceField
              control={control}
              name="total_axles"
              label={tr("number_of_axles")}
              compact
              optional
              options={AxlesList.map((v) => ({
                value: `${v}`,
                label: `${v}`,
              }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label={tr("services.seating_capacity")}
                name={"seats"}
                control={form.control}
                required={false}
              />
              {isTruck && (
                <NumberField
                  label={"Tonnage capacity (t)"}
                  name={"tonnage_capacity"}
                  control={form.control}
                  required={false}
                />
              )}
            </div>
          </div>
        </FormSection>

        {/* Features */}
        <FormSection
          icon={Sparkles}
          title="Features"
          description="Add-ons clients can see on this vehicle."
          className="xl:col-span-2"
          aside={
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {featureCount}
              <span className="font-normal text-muted-foreground">
                /{vehicleCofig?.features.length ?? 0}
              </span>
            </span>
          }
        >
          <FeaturePicker
            features={vehicleCofig?.features}
            selected={selectedFeatures ?? []}
            onToggle={toggleFeatures}
          />
        </FormSection>
      </div>

      {/* Preview + actions */}
      <aside className="space-y-4 lg:sticky lg:top-16">
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b p-4">
            <VehicleIconTile isTruck={isTruck} />
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {[brand?.name, model?.name].filter(Boolean).join(" ") ||
                  "New vehicle"}
              </p>
              <p className="text-sm text-muted-foreground">
                {[values.year, vehicleCategory?.name]
                  .filter(Boolean)
                  .join(" · ") || "Pick a make and model"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">
            {values.plate_number ? (
              <PlateNumber value={String(values.plate_number)} size="lg" />
            ) : (
              <span className="rounded-md border-2 border-dashed px-2.5 py-1 font-mono text-sm tracking-widest text-muted-foreground">
                NO PLATE
              </span>
            )}
            {!!values.second_plate_number && (
              <PlateNumber value={String(values.second_plate_number)} />
            )}
          </div>
          <dl className="divide-y text-sm">
            <PreviewRow icon={Palette} label="Colour">
              {values.color ? (
                <span className="inline-flex items-center gap-1.5">
                  <ColorDot name={String(values.color)} />
                  {carColor(String(values.color)).label}
                  {!!values.interior_color && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <ColorDot name={String(values.interior_color)} />
                    </>
                  )}
                </span>
              ) : null}
            </PreviewRow>
            <PreviewRow icon={Fuel} label="Engine">
              {values.engine_type
                ? [
                    tr(`common.${values.engine_type as "petrol"}`),
                    values.cylinders && `${values.cylinders} cyl`,
                    isFilled(values.tank_capacity) &&
                      `${formatNumber(values.tank_capacity as number)} cc`,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : null}
            </PreviewRow>
            <PreviewRow icon={Cog} label="Gearbox">
              {values.gearbox
                ? [tr(`common.${values.gearbox as "manual"}`), driveTrain?.name]
                    .filter(Boolean)
                    .join(" · ")
                : null}
            </PreviewRow>
            <PreviewRow icon={Gauge} label="Economy">
              {isFilled(values.fuel_consumption_rate)
                ? `${formatNumber(values.fuel_consumption_rate as number)} km/l`
                : null}
            </PreviewRow>
            <PreviewRow icon={isTruck ? Weight : Armchair} label="Capacity">
              {[
                isFilled(values.seats) && `${values.seats} seats`,
                isFilled(values.tonnage_capacity) &&
                  `${values.tonnage_capacity} t`,
                values.total_axles && `${values.total_axles} axles`,
              ]
                .filter(Boolean)
                .join(" · ") || null}
            </PreviewRow>
            <PreviewRow icon={Sparkles} label="Features">
              {featureCount > 0 ? `${featureCount} selected` : null}
            </PreviewRow>
          </dl>
        </section>

        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-medium">Required details</span>
            <span className="text-muted-foreground tabular-nums">
              {filledCount}/{REQUIRED_FIELDS.length}
            </span>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 shadow-sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Check />
              )}
              {isEdit ? "Save changes" : "Add vehicle"}
            </Button>
          </div>
        </section>
      </aside>
    </form>
  )
}

/* ------------------------------------------------------------------ */

function FormSection({
  icon: Icon,
  title,
  description,
  aside,
  className,
  children,
}: {
  icon: IconType
  title: string
  description?: string
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border bg-card shadow-xs transition-[box-shadow,border-color] duration-300",
        "focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/15",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4.5" />
          </span>
          <div>
            <h2 className="leading-tight font-semibold">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {aside}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  )
}

/** Single choice from a short list, shown as selectable tiles. */
function ChoiceField({
  control,
  name,
  label,
  options,
  compact,
  optional,
}: {
  control: Control<Record<string, unknown>>
  name: string
  label: string
  options: { value: string; label: string; icon?: IconType }[]
  /** Small square chips (numbers) instead of wide tiles. */
  compact?: boolean
  /** Clicking the selected option clears it. */
  optional?: boolean
}) {
  const labelId = `${name}-label`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel id={labelId}>{label}</FieldLabel>
          <div
            role="radiogroup"
            aria-labelledby={labelId}
            className={cn(
              "flex flex-wrap gap-2",
              !compact && "grid grid-cols-2"
            )}
          >
            {options.map((o) => {
              const selected = field.value === o.value
              const Icon = o.icon
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    field.onChange(selected && optional ? null : o.value)
                    field.onBlur()
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border bg-card text-sm font-medium text-muted-foreground transition-all outline-none hover:border-primary/40 hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                    compact ? "size-10 tabular-nums" : "h-10 px-3",
                    selected &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    fieldState.invalid && !selected && "border-destructive/50"
                  )}
                >
                  {Icon && <Icon className="size-4" />}
                  {o.label}
                </button>
              )
            })}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function FeaturePicker({
  features,
  selected,
  onToggle,
}: {
  features: VehicleFeature[] | undefined
  selected: string[]
  onToggle: (featureId: string, checked: boolean) => void
}) {
  if (!features?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No features configured yet. Add them under Settings → Vehicle config.
      </p>
    )
  }
  const sorted = [...features].sort((a, b) => a.position - b.position)
  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((feat) => {
        const isOn = selected.includes(feat.id)
        return (
          <button
            key={feat.id}
            type="button"
            role="checkbox"
            aria-checked={isOn}
            onClick={() => onToggle(feat.id, !isOn)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm capitalize transition-all outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50",
              isOn
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border transition-colors",
                isOn && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {isOn && <Check className="size-3" />}
            </span>
            {feat.name}
          </button>
        )
      })}
    </div>
  )
}

function PreviewRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-right font-medium">
        {children ?? (
          <span className="font-normal text-muted-foreground">—</span>
        )}
      </dd>
    </div>
  )
}
