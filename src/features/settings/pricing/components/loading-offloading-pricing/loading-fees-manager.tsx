import { useState } from "react"
import { Plus } from "lucide-react"
import { formatPricingDate } from "../../utils/pricing-dates"
import { PricingVersionSelect } from "../pricing-version-select"
import { sortTiers, toFormTier } from "./loading-fees-format"
import { LoadingOffloadingPricingForm } from "./loading-offloading-pricing-form"
import { LoadingOffloadingPricingTable } from "./loading-offloading-pricing-table"
import type {
  LoadingOffloadingPricingResponse,
  PricingDates,
} from "../../types"
import type { LoadingOffloadingPricingRequest } from "../../schemas"
import { Button } from "@/components/ui/button"

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
  const [isEditing, setIsEditing] = useState(false)

  const dates = versions?.dates ?? []
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
        <PricingVersionSelect
          versions={versions}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          canActivate={canActivate}
          isActivating={isActivating}
          onActivate={onActivate}
        />

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
