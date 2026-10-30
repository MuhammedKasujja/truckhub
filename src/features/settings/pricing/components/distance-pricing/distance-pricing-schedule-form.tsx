/**
 * PriceScheduleForm
 * ------------------
 * A dynamic distance x tonnage price-schedule editor that saves/loads against
 * a SINGLE table: `distance_tonnage_rates`.
 *
 * EDITING MODEL (in-memory only, never sent to the DB as-is): brackets are
 * tracked with small ids (t_0_2, d_0_40, ...) purely so the UI can let you
 * edit a bracket's bounds once and have it apply to every price cell that
 * uses it, and so overlap can be checked per axis. This shape never touches
 * your database.
 *
 *   {
 *     "tonnageRanges": [{ "id": "t_0_2", "min": 0, "max": 2 }, ...],
 *     "distanceRanges": [{ "id": "d_0_40", "min": 0, "max": 40, "noUpperLimit": false }, ...],
 *     "rates": [
 *       { "distanceRangeId": "d_0_40", "tonnageRangeId": "t_0_2", "minPrice": 2220, "maxPrice": 2664 },
 *       ...
 *     ]
 *   }
 *
 * DB / SAVE PAYLOAD - what actually goes to `distance_tonnage_rates`, via
 * `toDbRows(schedule)`: one flat, self-contained row per price cell, bounds
 * inlined (no foreign keys, no joins):
 *
 *   [
 *     {
 *       "distance_min": 0, "distance_max": 40, "distance_no_upper_limit": false,
 *       "tonnage_min": 0, "tonnage_max": 2,
 *       "min_price": 2220, "max_price": 2664
 *     },
 *     ...
 *   ]
 *
 * `fromDbRows(rows)` does the reverse - given rows queried back from that
 * table, it re-derives the deduplicated bracket lists for the editing UI.
 * Both are exported as named exports below. See README.md for the table DDL.
 *
 * - Tonnage brackets and distance brackets are both fully dynamic (add / remove).
 * - Every (distance bracket x tonnage bracket) cell holds a Min price and a Max price.
 * - Neither axis may contain overlapping ranges (validated live, blocks saving).
 * - Tonnage is hard-capped at 30 MT.
 * - Two read-only views of the saved schedule: a pivot Grid (matches the
 *   original spreadsheet) and a sortable/searchable flat List, both built
 *   with @tanstack/react-table directly off the `rates` array.
 *
 */

import React, { useEffect, useMemo, useState } from "react"
import {
  useForm,
  useFieldArray,
  type FieldErrors,
  type UseFormRegister,
  type UseFormGetValues,
  type UseFieldArrayRemove,
  type FieldError,
  type UseFormRegisterReturn,
} from "react-hook-form"
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react"
import {
  buildScheduleFromForm,
  distanceLabel,
  DistanceRange,
  findOverlapIds,
  FormValues,
  makeId,
  MAX_TONNAGE,
  PriceSchedule,
  PriceScheduleFormProps,
  RateEntry,
  rateKey,
  scheduleToFormValues,
  toDbRows,
  tonnageLabel,
  TonnageRange,
} from "../../utils/distance-tonnage-pricing-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type DistancePricingScheduleFormProps = PriceScheduleFormProps & {
  initialDate?: Date
  onCancel?: () => void
}

export function DistancePricingDatagridForm({
  initialSchedule = {
    tonnageRanges: [],
    distanceRanges: [],
    rates: [],
  },
  initialDate,
  onSave,
  onCancel,
}: DistancePricingScheduleFormProps) {
  const [submittedSchedule, setSubmittedSchedule] =
    useState<PriceSchedule>(initialSchedule)
  const [pricingDate, setPricingDate] = useState<Date | undefined>(initialDate)

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: scheduleToFormValues(initialSchedule),
    mode: "onBlur",
  })

  // keyName avoids RHF overwriting our own domain `id` field on each array item.
  const tonnageArray = useFieldArray({
    control,
    name: "tonnageRanges",
    keyName: "fieldKey",
  })
  const distanceArray = useFieldArray({
    control,
    name: "distanceRanges",
    keyName: "fieldKey",
  })
  const ratesArray = useFieldArray({
    control,
    name: "rates",
    keyName: "fieldKey",
  })

  const watchedTonnage = watch("tonnageRanges")
  const watchedDistance = watch("distanceRanges")

  const tonnageIdsKey = watchedTonnage.map((t) => t.id).join(",")
  const distanceIdsKey = watchedDistance.map((d) => d.id).join(",")

  // Live overlap detection - drives inline warnings and disables Save.
  const tonnageOverlapIds = useMemo(
    () => findOverlapIds(watchedTonnage, (t) => Number(t.max)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(watchedTonnage)]
  )
  const distanceOverlapIds = useMemo(
    () =>
      findOverlapIds(watchedDistance, (d) =>
        d.noUpperLimit ? Infinity : Number(d.max)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(watchedDistance)]
  )
  const openEndedCount = watchedDistance.filter((d) => d.noUpperLimit).length
  const hasBlockingErrors =
    tonnageOverlapIds.size > 0 ||
    distanceOverlapIds.size > 0 ||
    openEndedCount > 1

  // Whenever a bracket is added/removed, keep `rates` in sync: drop entries
  // whose bracket no longer exists, append entries for new combinations.
  // Surgical add/remove (not a full replace) so untouched rows keep their
  // identity and don't lose focus/remount while the user is mid-edit.
  useEffect(() => {
    const current = getValues("rates") || []
    const validKeys = new Set<string>()
    watchedDistance.forEach((d) =>
      watchedTonnage.forEach((t) => validKeys.add(rateKey(d.id, t.id)))
    )

    for (let i = current.length - 1; i >= 0; i -= 1) {
      if (
        !validKeys.has(
          rateKey(current[i].distanceRangeId, current[i].tonnageRangeId)
        )
      ) {
        ratesArray.remove(i)
      }
    }

    const existingKeys = new Set(
      (getValues("rates") || []).map((r) =>
        rateKey(r.distanceRangeId, r.tonnageRangeId)
      )
    )
    const toAppend: RateEntry[] = []
    watchedDistance.forEach((d) => {
      watchedTonnage.forEach((t) => {
        const key = rateKey(d.id, t.id)
        if (!existingKeys.has(key)) {
          toAppend.push({
            distanceRangeId: d.id,
            tonnageRangeId: t.id,
            minPrice: NaN,
            maxPrice: NaN,
          })
        }
      })
    })
    if (toAppend.length) ratesArray.append(toAppend)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonnageIdsKey, distanceIdsKey])

  const lastTonnageMax = Number(
    watchedTonnage[watchedTonnage.length - 1]?.max ?? -1
  )
  const lastDistanceOpenEnded = Boolean(
    watchedDistance[watchedDistance.length - 1]?.noUpperLimit
  )

  const addTonnageRange = () => {
    const nextMin = Math.min(lastTonnageMax + 1, MAX_TONNAGE)
    tonnageArray.append({ id: makeId("t"), min: nextMin, max: MAX_TONNAGE })
  }

  const addDistanceRange = () => {
    const last = watchedDistance[watchedDistance.length - 1]
    const nextMin = last ? Number(last.max ?? last.min) + 1 : 0
    distanceArray.append({
      id: makeId("d"),
      min: nextMin,
      max: nextMin + 50,
      noUpperLimit: false,
    })
  }

  const onSubmit = (data: FormValues) => {
    if (hasBlockingErrors) return
    if (!pricingDate) {
      toast.error("Pricing date is required")
      return
    }
    const schedule = buildScheduleFromForm(data)
    setSubmittedSchedule(schedule)
    if (onSave) onSave(toDbRows(schedule), schedule, pricingDate)
  }

  const handleCancelClick = () => {
    reset(scheduleToFormValues(submittedSchedule))
    if (onCancel) onCancel()
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="w-full space-y-2.5 md:w-80">
        <Label>Effective Date *</Label>
        <DatePicker
          initialDate={pricingDate}
          onDateChanged={(date) => {
            setPricingDate(date)
          }}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <BracketCard<TonnageRange>
            title="Tonnage brackets"
            hint={`Weight ranges in metric tonnes (MT), capped at ${MAX_TONNAGE} MT.`}
            fields={tonnageArray.fields}
            overlapIds={tonnageOverlapIds}
            onAdd={addTonnageRange}
            onRemove={tonnageArray.remove}
            addDisabled={lastTonnageMax >= MAX_TONNAGE}
            renderRow={(_field, index) => (
              <>
                <NumberField
                  label="Min (MT)"
                  error={errors.tonnageRanges?.[index]?.min}
                  inputProps={register(`tonnageRanges.${index}.min`, {
                    required: "Required",
                    valueAsNumber: true,
                    min: { value: 0, message: "≥ 0" },
                    max: { value: MAX_TONNAGE, message: `≤ ${MAX_TONNAGE}` },
                  })}
                />
                <NumberField
                  label="Max (MT)"
                  error={errors.tonnageRanges?.[index]?.max}
                  inputProps={register(`tonnageRanges.${index}.max`, {
                    required: "Required",
                    valueAsNumber: true,
                    max: {
                      value: MAX_TONNAGE,
                      message: `Max is ${MAX_TONNAGE}`,
                    },
                    validate: (v) =>
                      Number(v) >
                        Number(getValues(`tonnageRanges.${index}.min`)) ||
                      "Must be > min",
                  })}
                />
              </>
            )}
          />

          <BracketCard<DistanceRange>
            title="Distance brackets"
            hint="Distance ranges in kilometres (KM). The last bracket can be open-ended."
            fields={distanceArray.fields}
            overlapIds={distanceOverlapIds}
            onAdd={addDistanceRange}
            onRemove={distanceArray.remove}
            addDisabled={lastDistanceOpenEnded}
            renderRow={(_field, index) => {
              const isOpenEnded = watchedDistance[index]?.noUpperLimit
              return (
                <>
                  <NumberField
                    label="Min (KM)"
                    error={errors.distanceRanges?.[index]?.min}
                    inputProps={register(`distanceRanges.${index}.min`, {
                      required: "Required",
                      valueAsNumber: true,
                      min: { value: 0, message: "≥ 0" },
                    })}
                  />
                  <NumberField
                    label="Max (KM)"
                    error={errors.distanceRanges?.[index]?.max}
                    disabled={isOpenEnded}
                    inputProps={register(`distanceRanges.${index}.max`, {
                      validate: (v) => {
                        if (getValues(`distanceRanges.${index}.noUpperLimit`))
                          return true
                        if (
                          v === undefined ||
                          v === null ||
                          Number.isNaN(Number(v))
                        )
                          return "Required"
                        return (
                          Number(v) >
                            Number(getValues(`distanceRanges.${index}.min`)) ||
                          "Must be > min"
                        )
                      },
                    })}
                  />
                  <label className="mt-4 flex shrink-0 flex-col items-center gap-1 text-[8px] font-medium text-slate-400 uppercase">
                    Open-ended
                    <Checkbox
                      className="h-4 w-4 rounded"
                      {...register(`distanceRanges.${index}.noUpperLimit`)}
                    />
                  </label>
                </>
              )
            }}
          />
        </div>

        <PriceGridCard
          distanceRanges={watchedDistance}
          tonnageRanges={watchedTonnage}
          ratesFields={ratesArray.fields}
          register={register}
          getValues={getValues}
          errors={errors}
        />

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm backdrop-blur">
          <div className="min-h-4">
            {openEndedCount > 1 && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertTriangle className="h-4 w-4" /> Only one distance bracket
                can be open-ended.
              </p>
            )}
            {openEndedCount <= 1 && hasBlockingErrors && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertTriangle className="h-4 w-4" /> Fix the highlighted
                overlapping ranges before saving.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCancelClick}
              variant={"outline"}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={hasBlockingErrors}>
              <CheckCircle2 className="h-4 w-4" /> Save schedule
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NumberFieldProps {
  label: string
  error?: FieldError
  inputProps: UseFormRegisterReturn
  disabled?: boolean
}

function NumberField({ label, error, inputProps, disabled }: NumberFieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-[10px] font-medium text-slate-400 uppercase">
        {label}
      </label>
      <input
        type="number"
        step="1"
        disabled={disabled}
        {...inputProps}
        className={`w-full rounded-md border px-2 py-1 text-sm tabular-nums focus:ring-1 focus:outline-none ${
          disabled
            ? "border-slate-200 bg-slate-100 text-slate-400"
            : "focus:border-primay border-slate-300 focus:ring-primary"
        }`}
      />
      {error && (
        <p className="mt-0.5 text-[10px] text-destructive-foreground">
          {error.message}
        </p>
      )}
    </div>
  )
}

interface BracketCardProps<T extends { id: string }> {
  title: string
  hint: string
  fields: (T & { fieldKey: string })[]
  overlapIds: Set<string>
  onAdd: () => void
  onRemove: UseFieldArrayRemove
  addDisabled: boolean
  renderRow: (field: T & { fieldKey: string }, index: number) => React.ReactNode
}

function BracketCard<T extends { id: string }>({
  title,
  hint,
  fields,
  overlapIds,
  onAdd,
  onRemove,
  addDisabled,
  renderRow,
}: BracketCardProps<T>) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {title}
          </h2>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        <Button type="button" onClick={onAdd} disabled={addDisabled}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const hasOverlap = overlapIds.has(field.id)
          return (
            <div
              key={field.fieldKey}
              className={`flex items-end gap-2 rounded-lg border p-2 ${
                hasOverlap ? "border-rose-300 bg-rose-50" : "border-slate-200"
              }`}
            >
              {renderRow(field, index)}
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={fields.length === 1}
                className="mb-0.5 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Remove bracket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {overlapIds.size > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5" /> Highlighted brackets overlap
          - adjust min/max so ranges don&apos;t intersect.
        </p>
      )}
    </section>
  )
}

interface PriceGridCardProps {
  distanceRanges: DistanceRange[]
  tonnageRanges: TonnageRange[]
  ratesFields: (RateEntry & { fieldKey: string })[]
  register: UseFormRegister<FormValues>
  getValues: UseFormGetValues<FormValues>
  errors: FieldErrors<FormValues>
}

function PriceGridCard({
  distanceRanges,
  tonnageRanges,
  ratesFields,
  register,
  getValues,
  errors,
}: PriceGridCardProps) {
  // Index lookup into the `rates` field array by (distanceRangeId, tonnageRangeId).
  const indexByKey: Record<string, number> = {}
  ratesFields.forEach((r, i) => {
    indexByKey[rateKey(r.distanceRangeId, r.tonnageRangeId)] = i
  })

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Price grid
        </h2>
        <p className="text-xs text-slate-400">
          Each cell holds a price range for that distance x tonnage bracket -{" "}
          <span className="font-medium text-slate-600">Min</span> on top,{" "}
          <span className="font-medium text-amber-700">Max</span> (highlighted,
          must be ≥ Min) below.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b bg-background px-3 py-2 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase">
                Distance (KM)
              </th>
              {tonnageRanges.map((t) => (
                <th
                  key={t.id}
                  className="border-b border-l bg-background px-3 py-2 text-center text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase"
                >
                  {tonnageLabel(t)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distanceRanges.map((d, dIndex) => (
              <tr
                key={d.id}
                className={cn(
                  dIndex % 2 === 0 ? "bg-background/60" : "bg-card"
                )}
              >
                <td className="sticky left-0 z-10 border-b bg-inherit px-3 py-2 text-xs font-medium whitespace-nowrap text-slate-600">
                  {distanceLabel(d)}
                </td>
                {tonnageRanges.map((t) => {
                  const key = rateKey(d.id, t.id)
                  const idx = indexByKey[key]
                  if (idx === undefined) {
                    // Bracket was just added this render; the sync effect appends
                    // its rate entries right after - this cell fills in next render.
                    return (
                      <td
                        key={t.id}
                        className="border-b border-l px-2 py-2 text-center align-middle"
                      >
                        <span className="text-[10px] text-slate-300">
                          syncing…
                        </span>
                      </td>
                    )
                  }
                  const cellError = errors.rates?.[idx]
                  return (
                    <td
                      key={t.id}
                      className="border-b border-l px-2 py-2 align-top"
                    >
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          step="1"
                          placeholder="Min"
                          {...register(`rates.${idx}.minPrice`, {
                            required: "Required",
                            valueAsNumber: true,
                            min: { value: 0, message: "≥ 0" },
                          })}
                          className="focus:ring-primay w-24 rounded-md border px-2 py-1 text-xs tabular-nums focus:border-primary focus:ring-1 focus:outline-none"
                        />
                        <input
                          type="number"
                          step="1"
                          placeholder="Max"
                          {...register(`rates.${idx}.maxPrice`, {
                            required: "Required",
                            valueAsNumber: true,
                            min: { value: 0, message: "≥ 0" },
                            validate: (v) =>
                              Number(v) >=
                                Number(getValues(`rates.${idx}.minPrice`)) ||
                              "≥ Min",
                          })}
                          className="w-24 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs tabular-nums focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                        {(cellError?.minPrice || cellError?.maxPrice) && (
                          <p className="text-[10px] leading-tight text-rose-600">
                            {cellError?.minPrice?.message ||
                              cellError?.maxPrice?.message}
                          </p>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
