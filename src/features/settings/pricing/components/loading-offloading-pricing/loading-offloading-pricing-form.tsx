import { Check, Plus, Trash2 } from "lucide-react"
import { useController, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoadingOffloadingPricingSchema } from "../../schemas"
import { todayIsoDate } from "../../utils/pricing-dates"
import { DEFAULT_TIERS, nextTier } from "./loading-fees-format"
import { TierNumber } from "./loading-offloading-pricing-table"
import type { LoadingOffloadingPricingRequest } from "../../schemas"
import type { Control, ControllerRenderProps } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DatePickerField, MoneyField } from "@/components/ui/form-fields"
import { formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

type FormValues = LoadingOffloadingPricingRequest

type LoadingOffloadingPricingFormProps = {
  initialData?: Partial<FormValues>
  title?: string
  description?: string
  submitText?: string
  isSubmitting?: boolean
  onSubmit: (data: FormValues) => Promise<void>
  onCancel?: () => void
}

/** Shared column template so the header lines up with every tier row. */
const TIER_GRID =
  "md:grid-cols-[2rem_minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]"

export function LoadingOffloadingPricingForm({
  initialData,
  title = "New pricing version",
  description = "Set the tonnage and volume ranges for each tier and what to charge.",
  submitText = "Save pricing",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: LoadingOffloadingPricingFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(LoadingOffloadingPricingSchema),
    defaultValues: {
      client_id: initialData?.client_id,
      effective_date: initialData?.effective_date ?? todayIsoDate(),
      pricings: initialData?.pricings?.length
        ? initialData.pricings
        : DEFAULT_TIERS,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  function addTier() {
    const last = form.getValues("pricings").at(-1)
    append(nextTier(last), {
      focusName: `pricings.${fields.length}.tonnage_max`,
    })
  }

  const pricingsError = form.formState.errors.pricings
  const listError = pricingsError?.root?.message ?? pricingsError?.message

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="w-full sm:w-60">
          <DatePickerField
            label="Effective date"
            name="effective_date"
            control={form.control}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold">Fee tiers</h4>
            <p className="text-xs text-muted-foreground">
              Ranges are inclusive and can&apos;t overlap, e.g. 2–3 t then 4–6
              t.
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatPlural(fields.length, { singular: "tier", plural: "tiers" })}
          </span>
        </div>

        <div
          aria-hidden
          className={cn(
            "hidden gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid",
            TIER_GRID
          )}
        >
          <span>#</span>
          <span>Tonnage (t)</span>
          <span>CMB (m³)</span>
          <span>Loading fee</span>
          <span>Offloading fee</span>
          <span />
        </div>

        <ol className="space-y-3 p-3 md:space-y-0 md:divide-y md:p-0">
          {fields.map((field, index) => (
            <TierRow
              key={field.id}
              index={index}
              control={form.control}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}
        </ol>

        <div className="border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full border border-dashed text-muted-foreground hover:text-foreground"
            onClick={addTier}
          >
            <Plus />
            Add tier
          </Button>
          {listError && (
            <p
              role="alert"
              className="mt-2 text-center text-sm text-destructive"
            >
              {listError}
            </p>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-end gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" className="shadow-sm" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <Check />}
          {isSubmitting ? "Saving…" : submitText}
        </Button>
      </div>
    </form>
  )
}

function TierRow({
  index,
  control,
  canRemove,
  onRemove,
}: {
  index: number
  control: Control<FormValues>
  canRemove: boolean
  onRemove: () => void
}) {
  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={!canRemove}
      onClick={onRemove}
      aria-label={`Remove tier ${index + 1}`}
      title="Remove tier"
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 />
    </Button>
  )

  return (
    <li
      className={cn(
        "grid grid-cols-2 items-start gap-3 rounded-lg border p-3 transition-colors md:rounded-none md:border-0 md:px-4 md:py-2.5 md:hover:bg-muted/30",
        TIER_GRID
      )}
    >
      <div className="col-span-2 flex items-center justify-between md:col-span-1 md:h-9">
        <TierNumber value={index + 1} />
        <div className="md:hidden">{removeButton}</div>
      </div>

      <RangeField
        control={control}
        index={index}
        kind="tonnage"
        label="Weight"
        unit="t"
      />
      <RangeField
        control={control}
        index={index}
        kind="cbm"
        label="Volume"
        unit="m³"
      />

      <div className="space-y-1.5">
        <MobileLabel>Loading fee</MobileLabel>
        <MoneyField control={control} name={`pricings.${index}.loading_fees`} />
      </div>
      <div className="space-y-1.5">
        <MobileLabel>Offloading fee</MobileLabel>
        <MoneyField
          control={control}
          name={`pricings.${index}.offloading_fees`}
        />
      </div>

      <div className="hidden h-9 items-center justify-end md:flex">
        {removeButton}
      </div>
    </li>
  )
}

/** A min – max pair with a single error line underneath. */
function RangeField({
  control,
  index,
  kind,
  label,
  unit,
}: {
  control: Control<FormValues>
  index: number
  kind: "tonnage" | "cbm"
  label: string
  unit: string
}) {
  const min = useController({ control, name: `pricings.${index}.${kind}_min` })
  const max = useController({ control, name: `pricings.${index}.${kind}_max` })
  const error = min.fieldState.error?.message ?? max.fieldState.error?.message

  return (
    <div className="col-span-2 space-y-1.5 sm:col-span-1">
      <MobileLabel>
        {label} ({unit})
      </MobileLabel>
      <div className="flex items-center gap-1.5">
        <BoundInput
          field={min.field}
          invalid={!!min.fieldState.error}
          placeholder="Min"
          aria-label={`Tier ${index + 1} ${label.toLowerCase()} min`}
        />
        <span aria-hidden className="text-muted-foreground">
          –
        </span>
        <BoundInput
          field={max.field}
          invalid={!!max.fieldState.error}
          placeholder="Max"
          aria-label={`Tier ${index + 1} ${label.toLowerCase()} max`}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function BoundInput({
  field,
  invalid,
  ...props
}: {
  field: ControllerRenderProps<
    FormValues,
    `pricings.${number}.${"tonnage" | "cbm"}_${"min" | "max"}`
  >
  invalid: boolean
  placeholder: string
  "aria-label": string
}) {
  return (
    <Input
      {...props}
      ref={field.ref}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputMode="decimal"
      autoComplete="off"
      aria-invalid={invalid}
      className="min-w-0 text-center tabular-nums"
    />
  )
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground md:sr-only">
      {children}
    </p>
  )
}
