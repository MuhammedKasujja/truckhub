import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format as formatDateFns } from "date-fns"
import {
  CalendarDays,
  Globe2,
  Hash,
  Loader2,
  MapPin,
  RotateCcw,
  Save,
} from "lucide-react"
import { useEditSettings } from "../hooks/use-settings"
import { OptionTile, SettingsSection } from "./settings-ui"
import type z from "zod"
import type {
  EditSettingsSchemaType} from "@/features/settings/schemas";
import { Button } from "@/components/ui/button"
import {
  NumberField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { DATE_FORMATS, MONTH_OPTIONS } from "@/common/constants"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  EditSettingsSchema
} from "@/features/settings/schemas"
import { cn } from "@/lib/utils"

type EditSettingsFormProps = {
  settings?: EditSettingsSchemaType
}

type FormValues = z.infer<typeof EditSettingsSchema>

/** Settings store moment-style tokens (YYYY, DD); date-fns wants yyyy, dd. */
function previewDate(pattern: string, date: Date) {
  try {
    return formatDateFns(
      date,
      pattern.replace(/YYYY/g, "yyyy").replace(/D/g, "d")
    )
  } catch {
    return pattern
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const monthOptions = MONTH_OPTIONS.map((m) => ({
  ...m,
  label: capitalize(m.label),
}))

export function EditSettingsForm({ settings }: EditSettingsFormProps) {
  const { mutate: updateSettings, isPending } = useEditSettings()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("config:edit")

  const form = useForm<FormValues>({
    resolver: zodResolver(EditSettingsSchema),
    defaultValues: settings,
  })

  const [padding, radius] = useWatch({
    control: form.control,
    name: ["counter_padding", "search_radius"],
  })
  const today = useMemo(() => new Date(), [])

  const paddedSample = String(42).padStart(
    Math.min(Math.max(Number(padding) || 0, 0), 12),
    "0"
  )
  const radiusKm = Number(radius) > 0 ? Number(radius) / 1000 : null

  function onSubmit(values: FormValues) {
    updateSettings(values, {
      onSuccess: () => form.reset(values),
    })
  }

  const isDirty = form.formState.isDirty

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <fieldset disabled={!canEdit} className="contents">
        <SettingsSection
          icon={Globe2}
          title="Regional"
          description="Currency, dates and your financial year"
        >
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Currency code"
                name="currency_code"
                control={form.control}
                placeholder="UGX"
                description="ISO 4217 code used when formatting amounts."
              />
              <SelectField
                label="Financial year starts in"
                name="fiscal_year_start_month"
                control={form.control}
                options={monthOptions}
              />
            </div>

            <Controller
              control={form.control}
              name="date_format"
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      Date format
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Previews use today's date
                    </p>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Date format"
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {DATE_FORMATS.map((pattern) => (
                      <OptionTile
                        key={pattern}
                        selected={field.value === pattern}
                        onSelect={() => field.onChange(pattern)}
                        title={previewDate(pattern, today)}
                        description={pattern}
                      />
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        </SettingsSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsSection
            icon={Hash}
            title="Document numbers"
            description="How invoice, quotation and other numbers are padded"
          >
            <div className="space-y-4">
              <NumberField
                label="Counter padding"
                name="counter_padding"
                control={form.control}
                description="Minimum number of digits in a counter."
              />
              <SamplePreview label="Counter 42 becomes" value={paddedSample} />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={MapPin}
            title="Location search"
            description="How far around a point to look for places"
          >
            <div className="space-y-4">
              <NumberField
                label="Search radius (metres)"
                name="search_radius"
                control={form.control}
              />
              <SamplePreview
                label="Covers about"
                value={
                  radiusKm === null
                    ? "–"
                    : `${radiusKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`
                }
              />
            </div>
          </SettingsSection>
        </div>
      </fieldset>

      {/* Save bar: shown while there are unsaved changes */}
      {canEdit && (
        <div
          className={cn(
            "sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-all",
            isDirty
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          )}
          aria-hidden={!isDirty}
        >
          <p className="text-sm">
            <span className="font-medium">Unsaved changes</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}
              · These apply to everyone in the company
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => form.reset()}
            >
              <RotateCcw />
              Discard
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              Save changes
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

function SamplePreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {value}
      </span>
    </div>
  )
}
