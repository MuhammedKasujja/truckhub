"use client"

import { useFieldArray, Control, FieldErrors } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { BatchPricingInput } from "../schemas"

interface TonnageRangeFieldsProps {
  routeIndex: number
  control: Control<BatchPricingInput>
  errors: FieldErrors<BatchPricingInput>
}

export function TonnageRangeFields({
  routeIndex,
  control,
  errors,
}: TonnageRangeFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `routes.${routeIndex}.ranges`,
  })

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_1fr_1.5fr_32px] gap-2 px-1">
        {["Min (t)", "Max (t)", "Price (UGX)"].map((h) => (
          <span
            key={h}
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {h}
          </span>
        ))}
        <span />
      </div>

      {fields.map((field, rangeIndex) => {
        const rangeErrors = errors?.routes?.[routeIndex]?.ranges?.[rangeIndex]

        return (
          <div key={field.id} className="space-y-1">
            <div className="grid grid-cols-[1fr_1fr_1.5fr_32px] items-center gap-2">
              {/* min_tons */}
              <div>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 1"
                  aria-invalid={!!rangeErrors?.min_tons}
                  {...control.register(
                    `routes.${routeIndex}.ranges.${rangeIndex}.min_tons`,
                    { valueAsNumber: true }
                  )}
                  className={cn(rangeErrors?.min_tons && "border-destructive")}
                />
              </div>

              {/* max_tons */}
              <div>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 9"
                  aria-invalid={!!rangeErrors?.max_tons}
                  {...control.register(
                    `routes.${routeIndex}.ranges.${rangeIndex}.max_tons`,
                    { valueAsNumber: true }
                  )}
                  className={cn(rangeErrors?.max_tons && "border-destructive")}
                />
              </div>

              {/* price */}
              <div>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 50000"
                  aria-invalid={!!rangeErrors?.price}
                  {...control.register(
                    `routes.${routeIndex}.ranges.${rangeIndex}.price`,
                    { valueAsNumber: true }
                  )}
                  className={cn(rangeErrors?.price && "border-destructive")}
                />
              </div>

              {/* remove */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  fields.length <= 2 && "pointer-events-none invisible"
                )}
                onClick={() => remove(rangeIndex)}
                aria-label="Remove range"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Inline errors per row */}
            {(rangeErrors?.min_tons ||
              rangeErrors?.max_tons ||
              rangeErrors?.price) && (
              <div className="grid grid-cols-[1fr_1fr_1.5fr_32px] gap-2 px-1">
                <p className="text-xs text-destructive">
                  {rangeErrors?.min_tons?.message}
                </p>
                <p className="text-xs text-destructive">
                  {rangeErrors?.max_tons?.message}
                </p>
                <p className="text-xs text-destructive">
                  {rangeErrors?.price?.message}
                </p>
                <span />
              </div>
            )}
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1 w-full border-dashed text-muted-foreground hover:text-foreground"
        onClick={() =>
          append({
            min_tons: undefined as any,
            max_tons: undefined as any,
            price: undefined as any,
            client_id: null,
          })
        }
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add range
      </Button>
    </div>
  )
}
