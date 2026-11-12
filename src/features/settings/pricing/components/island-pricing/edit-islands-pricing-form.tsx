import { useMemo } from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IslandsListPricingSchema } from "../../schemas"
import { todayIsoDate } from "../../utils/pricing-dates"
import type { IslandsListPricingRequest } from "../../schemas"
import type { Control } from "react-hook-form"
import type { Island } from "@/features/settings/islands/types"
import { islandsQueryOptions } from "@/features/settings/islands/query-options"
import { LocationChips } from "@/features/settings/islands/components/island-locations"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { DatePickerField, MoneyField } from "@/components/ui/form-fields"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

type FormValues = IslandsListPricingRequest

type IslandPricingFormProps = {
  initialData?: Partial<FormValues>
  title?: string
  description?: string
  submitText?: string
  isSubmitting?: boolean
  onSubmit: (data: FormValues) => Promise<void>
  onCancel?: () => void
}

const emptyRow = { island_id: "", price: "" }

/** Shared column template so the header lines up with every row. */
const ROW_GRID =
  "md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,11rem)_2rem]"

export function IslandPricingForm({
  initialData,
  title = "New pricing version",
  description = "Set what to charge for deliveries to each island.",
  submitText = "Save pricing",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: IslandPricingFormProps) {
  const { data: islandsResponse, isLoading: isLoadingIslands } = useQuery(
    islandsQueryOptions()
  )
  const islands = useMemo(
    () =>
      [...(islandsResponse?.data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [islandsResponse]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(IslandsListPricingSchema),
    defaultValues: {
      effective_date: initialData?.effective_date ?? todayIsoDate(),
      pricings: initialData?.pricings?.length
        ? initialData.pricings
        : [emptyRow],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricings",
  })

  const rows = useWatch({ control: form.control, name: "pricings" })
  const usedIds = new Set(rows.map((r) => r.island_id).filter(Boolean))
  const remaining = islands.filter((i) => !usedIds.has(i.id))
  const allPriced =
    !isLoadingIslands && islands.length > 0 && remaining.length === 0

  function addRow() {
    append(emptyRow, { focusName: `pricings.${fields.length}.island_id` })
  }

  function addRemaining() {
    // Fill a blank last row first rather than leaving it dangling
    const last = rows.at(-1)
    const startsBlank = !!last && !last.island_id && !last.price
    const toAdd = remaining.map((i) => ({ island_id: i.id, price: "" }))
    if (startsBlank) remove(rows.length - 1)
    append(toAdd, {
      focusName: `pricings.${rows.length - (startsBlank ? 1 : 0)}.price`,
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
            <h4 className="text-sm font-semibold">Island prices</h4>
            <p className="text-xs text-muted-foreground">
              One price per island. Locations come from the island&apos;s
              settings.
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {islands.length > 0
              ? `${fields.length} of ${islands.length} islands`
              : formatPlural(fields.length, {
                  singular: "island",
                  plural: "islands",
                })}
          </span>
        </div>

        <div
          aria-hidden
          className={cn(
            "hidden gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid",
            ROW_GRID
          )}
        >
          <span>Island</span>
          <span>Locations</span>
          <span>Price</span>
          <span />
        </div>

        <ol className="space-y-3 p-3 md:space-y-0 md:divide-y md:p-0">
          {fields.map((field, index) => (
            <IslandRow
              key={field.id}
              index={index}
              control={form.control}
              islands={islands}
              isLoadingIslands={isLoadingIslands}
              usedIds={usedIds}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}
        </ol>

        <div className="border-t p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border border-dashed text-muted-foreground hover:text-foreground"
              disabled={allPriced}
              onClick={addRow}
            >
              <Plus />
              {allPriced ? "Every island is priced" : "Add island"}
            </Button>
            {remaining.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={addRemaining}
              >
                Add remaining ({remaining.length})
              </Button>
            )}
          </div>
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

function IslandRow({
  index,
  control,
  islands,
  isLoadingIslands,
  usedIds,
  canRemove,
  onRemove,
}: {
  index: number
  control: Control<FormValues>
  islands: Island[]
  isLoadingIslands: boolean
  usedIds: Set<string>
  canRemove: boolean
  onRemove: () => void
}) {
  const islandId = useWatch({ control, name: `pricings.${index}.island_id` })
  const island = islands.find((i) => i.id === islandId)

  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={!canRemove}
      onClick={onRemove}
      aria-label={`Remove ${island?.name ?? `row ${index + 1}`}`}
      title="Remove island"
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 />
    </Button>
  )

  return (
    <li
      className={cn(
        "grid grid-cols-1 items-start gap-3 rounded-lg border p-3 transition-colors md:rounded-none md:border-0 md:px-4 md:py-2.5 md:hover:bg-muted/30",
        ROW_GRID
      )}
    >
      <Controller
        control={control}
        name={`pricings.${index}.island_id`}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between md:contents">
              <MobileLabel>Island</MobileLabel>
              <div className="md:hidden">{removeButton}</div>
            </div>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoadingIslands}
            >
              <SelectTrigger
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                aria-label={`Island for row ${index + 1}`}
                className="w-full"
              >
                <SelectValue
                  placeholder={
                    isLoadingIslands ? "Loading islands…" : "Select island"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {islands.map((option) => {
                  const takenElsewhere =
                    option.id !== field.value && usedIds.has(option.id)
                  return (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      disabled={takenElsewhere}
                    >
                      {option.name}
                      {takenElsewhere && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          · added
                        </span>
                      )}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p role="alert" className="text-xs text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <div className="space-y-1.5 md:flex md:min-h-9 md:items-center">
        <MobileLabel>Locations</MobileLabel>
        {island ? (
          <LocationChips locations={island.locations} />
        ) : (
          <span className="text-sm text-muted-foreground/70">
            Select an island to see its locations
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <MobileLabel>Price</MobileLabel>
        <MoneyField control={control} name={`pricings.${index}.price`} />
      </div>

      <div className="hidden h-9 items-center justify-end md:flex">
        {removeButton}
      </div>
    </li>
  )
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground md:sr-only">
      {children}
    </p>
  )
}
