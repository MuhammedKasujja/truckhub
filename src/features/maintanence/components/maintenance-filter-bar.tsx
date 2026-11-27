import { ArchiveIcon, RotateCcw } from "lucide-react"
import { maintanenceTypes } from "../enums"
import type { MaintenanceType } from "../enums"
import type { MaintenanceSearchParamsInput } from "../schemas"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VehiclePicker } from "@/features/vehicles/components"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

const PER_COLUMN_OPTIONS = [10, 25, 50, 100]
export const DEFAULT_PER_COLUMN = 50

const ACTIVE_CLASS =
  "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"

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
      <div className="w-full sm:w-56">
        <VehiclePicker
          id="maintenance-vehicle"
          aria-label="Vehicle"
          value={search.vehicle_id}
          onChange={(vehicle) =>
            onSearchChange({ vehicle_id: vehicle?.id ?? undefined })
          }
        />
      </div>

      <ButtonGroup aria-label="Maintenance type">
        {[undefined, ...maintanenceTypes].map(
          (type: MaintenanceType | undefined) => {
            const active = (search.type ?? undefined) === type
            return (
              <Button
                key={type ?? "all"}
                variant="outline"
                aria-pressed={active}
                onClick={() => onSearchChange({ type })}
                className={cn("text-muted-foreground", active && ACTIVE_CLASS)}
              >
                {type ? tr(`maintenance.types.${type}`) : "All types"}
              </Button>
            )
          }
        )}
      </ButtonGroup>

      <Button
        variant="outline"
        aria-pressed={search.include_cancelled}
        onClick={() =>
          onSearchChange({ include_cancelled: !search.include_cancelled })
        }
        className={cn(
          "text-muted-foreground",
          search.include_cancelled && ACTIVE_CLASS
        )}
      >
        <ArchiveIcon />
        Show cancelled
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {isFiltered && (
          <Button
            variant="ghost"
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
