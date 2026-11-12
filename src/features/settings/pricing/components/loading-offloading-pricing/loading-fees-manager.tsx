import { useId, useState } from "react"
import { CalendarClock, CircleCheck, Plus } from "lucide-react"
import { formatPricingDate, sortTiers, toFormTier } from "./loading-fees-format"
import { LoadingOffloadingPricingForm } from "./loading-offloading-pricing-form"
import { LoadingOffloadingPricingTable } from "./loading-offloading-pricing-table"
import type {
  LoadingOffloadingPricingResponse,
  PricingDates,
} from "../../types"
import type { LoadingOffloadingPricingRequest } from "../../schemas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type LoadingFeesManagerProps = {
  /** Saved versions and which one is active. */
  versions?: PricingDates
  selectedDate?: string
  onSelectDate: (date: string) => void
  /** Tiers of the selected version. */
  pricing?: LoadingOffloadingPricingResponse
  isLoading?: boolean
  canActivate?: boolean
  isActivating?: boolean
  onActivate: (effectiveDate: string) => void
  isCreating?: boolean
  /** Should reject when saving fails, so the form stays open. */
  onCreate: (values: LoadingOffloadingPricingRequest) => Promise<unknown>
}

/**
 * Browse saved loading-fee versions, set one active, or create a new one.
 * Shared by the company pricing sheet and the client pricing dialog.
 */
export function LoadingFeesManager({
  versions,
  selectedDate,
  onSelectDate,
  pricing,
  isLoading,
  canActivate = true,
  isActivating,
  onActivate,
  isCreating,
  onCreate,
}: LoadingFeesManagerProps) {
  const selectId = useId()
  const [isEditing, setIsEditing] = useState(false)

  const dates = versions?.dates ?? []
  const activeDate = versions?.active_date
  const isActive = !!selectedDate && selectedDate === activeDate
  const tiers = pricing?.pricings ?? []

  async function handleCreate(values: LoadingOffloadingPricingRequest) {
    try {
      await onCreate(values)
      setIsEditing(false)
      onSelectDate(values.effective_date)
    } catch {
      // The mutation hook shows the error toast; keep the form open.
    }
  }

  if (isEditing) {
    const seeded = tiers.length > 0
    return (
      <LoadingOffloadingPricingForm
        initialData={{
          pricings: seeded ? sortTiers(tiers).map(toFormTier) : undefined,
        }}
        description={
          seeded
            ? `Starts from the ${formatPricingDate(pricing?.effective_date)} tiers. Adjust ranges and fees, then save as a new version.`
            : undefined
        }
        isSubmitting={isCreating}
        onSubmit={handleCreate}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  const newPricingButton = (
    <Button type="button" onClick={() => setIsEditing(true)}>
      <Plus />
      New pricing
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor={selectId} className="text-xs text-muted-foreground">
              Pricing version
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

        {tiers.length > 0 && newPricingButton}
      </div>

      <LoadingOffloadingPricingTable
        pricings={tiers}
        isLoading={isLoading}
        emptyAction={newPricingButton}
        emptyDescription={
          dates.length === 0
            ? "Create the first version by setting fee tiers by tonnage and volume."
            : "This version has no tiers."
        }
      />
    </div>
  )
}
