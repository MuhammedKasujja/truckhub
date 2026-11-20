import { RotateCcw } from "lucide-react"
import { maintanenceTypes } from "../enums"
import type { MaintenanceType } from "../enums"
import type { MaintenanceSearchParamsInput } from "../schemas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { VehiclePicker } from "@/features/vehicles/components"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

const PER_COLUMN_OPTIONS = [10, 25, 50, 100]
export const DEFAULT_PER_COLUMN = 50

type MaintenanceFilterBarProps = {
  search: MaintenanceSearchParamsInput
  onSearchChange: (updates: Partial<MaintenanceSearchParamsInput>) => void
}

/** Vehicle, type, cancelled and page-size filters above the board. */
export function MaintenanceFilterBar({
  search,
  onSearchChange,
}: MaintenanceFilterBarProps) {
  const tr = useTranslation()
  const isFiltered =
    !!search.vehicle_id ||
    !!search.type ||
    search.include_cancelled ||
    search.per_column !== DEFAULT_PER_COLUMN

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-60">
        <VehiclePicker
          id="maintenance-vehicle"
          aria-label="Vehicle"
          value={search.vehicle_id}
          onChange={(vehicle) =>
            onSearchChange({ vehicle_id: vehicle?.id ?? undefined })
          }
        />
      </div>

      <div
        role="group"
        aria-label="Maintenance type"
        className="inline-flex gap-0.5 rounded-lg border bg-background p-0.5"
      >
        {[undefined, ...maintanenceTypes].map(
          (type: MaintenanceType | undefined) => {
            const active = (search.type ?? undefined) === type
            return (
              <button
                key={type ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => onSearchChange({ type })}
                className={cn(
                  "flex h-7 items-center rounded-md px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active &&
                    "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
                )}
              >
                {type ? tr(`maintenance.types.${type}`) : "All types"}
              </button>
            )
          }
        )}
      </div>

      <div className="flex h-8 items-center gap-2 rounded-lg border bg-background px-2.5">
        <Switch
          id="maintenance-include-cancelled"
          size="sm"
          checked={search.include_cancelled}
          onCheckedChange={(include_cancelled) =>
            onSearchChange({ include_cancelled })
          }
        />
        <Label
          htmlFor="maintenance-include-cancelled"
          className="text-sm font-normal"
        >
          Show cancelled
        </Label>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onSearchChange({
                per_column: DEFAULT_PER_COLUMN,
                include_cancelled: false,
                vehicle_id: undefined,
                type: undefined,
              })
            }
          >
            <RotateCcw />
            Reset
          </Button>
        )}
        <Select
          value={String(search.per_column)}
          onValueChange={(value) =>
            onSearchChange({ per_column: Number(value) })
          }
        >
          <SelectTrigger
            size="sm"
            aria-label="Tasks per column"
            className="w-auto gap-1.5"
          >
            <span className="text-muted-foreground">Show</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PER_COLUMN_OPTIONS.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count} per column
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
