import * as React from "react"
import { BusFront, Car, Check, FileText, Truck, Upload, Van, X } from "lucide-react"
import { uncoveredVehicleTypes } from "../schemas"
import { VEHICLE_TYPES, labelFor } from "./driver-options"
import type { VehicleType } from "./driver-options"
import { Button } from "@/components/ui/button"
import { PhoneCaptureButton } from "@/features/phone-capture"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

export const VEHICLE_ICONS: Record<VehicleType, IconType> = {
  // motorcycle: Bike,
  car: Car,
  pickup_van: Van,
  minibus: BusFront,
  truck: Truck,
  // bus: Bus,
}

/**
 * Pick the categories a licence covers. Categories in `needed` (the driver's
 * vehicle types) are marked, and any of those not selected are flagged.
 */
export function LicenceCategoryPicker({
  value,
  onChange,
  needed,
  labelledBy,
  showAddMissing = true,
  labelSlot,
}: {
  value: VehicleType[]
  onChange: (next: VehicleType[]) => void
  needed: VehicleType[]
  /** The id of the element that labels the group. */
  labelledBy: string
  showAddMissing?: boolean
  /** Rendered on the left of the header row, usually the field label. */
  labelSlot?: React.ReactNode
}) {
  const missing = uncoveredVehicleTypes(needed, value)
  const toggle = (type: VehicleType) =>
    onChange(
      value.includes(type) ? value.filter((t) => t !== type) : [...value, type]
    )

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {labelSlot}
        {showAddMissing && missing.length > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => onChange([...new Set([...value, ...missing])])}
          >
            Add {missing.map((t) => labelFor("vehicleType", t)).join(", ")}
          </button>
        )}
      </div>
      <div
        role="group"
        aria-labelledby={labelledBy}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {VEHICLE_TYPES.map((type) => {
          const Icon = VEHICLE_ICONS[type]
          const isSelected = value.includes(type)
          const isNeeded = needed.includes(type)
          return (
            <button
              key={type}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(type)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
                isSelected && "border-primary bg-primary/5 hover:bg-primary/5",
                isNeeded && !isSelected && "border-dashed border-destructive/50"
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground"
                )}
              >
                {isSelected && <Check className="size-3" />}
              </span>
              <Icon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground",
                  isSelected && "text-primary"
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {labelFor("vehicleType", type)}
                </span>
                {isNeeded && (
                  <span
                    className={cn(
                      "block text-[11px]",
                      isSelected ? "text-muted-foreground" : "text-destructive"
                    )}
                  >
                    {isSelected ? "Drives this" : "Needed"}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

/** Choose one JPG, PNG or PDF, from this device or by phone capture. */
export const DocumentFilePicker = React.forwardRef<
  HTMLInputElement,
  {
    id: string
    name?: string
    value: File | undefined
    onChange: (file: File | undefined) => void
    onBlur?: () => void
    invalid?: boolean
  }
>(function DocumentFilePickerInner(
  { id, name, value: file, onChange, onBlur, invalid },
  ref
) {
  return (
    <>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove file"
            onClick={() => onChange(undefined)}
          >
            <X />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5",
            invalid && "border-destructive/60"
          )}
        >
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">Click to upload</span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG or PDF · up to 5MB
          </span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="sr-only"
        name={name}
        ref={ref}
        onBlur={onBlur}
        onChange={(e) => {
          onChange(e.target.files?.[0])
          e.target.value = ""
        }}
        aria-invalid={invalid}
      />
      {!file && (
        <PhoneCaptureButton
          accept=".jpg,.jpeg,.png,.pdf"
          onFile={(picked) => onChange(picked)}
          className="self-start"
        />
      )}
    </>
  )
})
