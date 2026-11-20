import { useId } from "react"
import { CalendarClock, CircleCheck } from "lucide-react"
import { formatPricingDate } from "../utils/pricing-dates"
import type { PricingDates } from "../types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PricingVersionSelectProps = {
  /** Saved versions and which one is active. */
  versions?: PricingDates
  selectedDate?: string
  onSelectDate: (date: string) => void
  /** Show "Set active" for an inactive version. */
  canActivate?: boolean
  isActivating?: boolean
  onActivate: (effectiveDate: string) => void
  label?: string
}

/**
 * Picks which saved pricing version to view, marks the active one, and
 * offers "Set active" for any other. Shared by every pricing config screen.
 */
export function PricingVersionSelect({
  versions,
  selectedDate,
  onSelectDate,
  canActivate = true,
  isActivating,
  onActivate,
  label = "Pricing version",
}: PricingVersionSelectProps) {
  const selectId = useId()
  const dates = versions?.dates ?? []
  const activeDate = versions?.active_date
  const isActive = !!selectedDate && selectedDate === activeDate

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor={selectId} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <Select
          value={selectedDate ?? ""}
          onValueChange={onSelectDate}
          disabled={dates.length === 0}
        >
          <SelectTrigger id={selectId} className="min-w-60">
            <CalendarClock className="text-muted-foreground" />
            <SelectValue placeholder="No versions yet" />
          </SelectTrigger>
          <SelectContent>
            {dates.map((date) => (
              <SelectItem key={date} value={date}>
                {formatPricingDate(date)}
                {date === activeDate && (
                  <span className="ml-1 text-xs font-medium text-primary">
                    · Active
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDate && !isActive && canActivate && (
        <Button
          type="button"
          variant="outline"
          disabled={isActivating}
          onClick={() => onActivate(selectedDate)}
        >
          <CircleCheck />
          {isActivating ? "Activating…" : "Set active"}
        </Button>
      )}
    </div>
  )
}
