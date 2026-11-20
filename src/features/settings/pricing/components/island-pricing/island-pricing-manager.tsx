import { useState } from "react"
import { Plus } from "lucide-react"
import { formatBound } from "../loading-offloading-pricing/loading-fees-format"
import { formatPricingDate } from "../../utils/pricing-dates"
import { PricingVersionSelect } from "../pricing-version-select"
import { IslandPricingForm } from "./edit-islands-pricing-form"
import { IslandPricingTable } from "./island-pricing-table"
import type { IslandPricingItem, PricingDates } from "../../types"
import type { IslandsListPricingRequest } from "../../schemas"
import { Button } from "@/components/ui/button"

type IslandPricingManagerProps = {
  /** Saved versions and which one is active. */
  versions?: PricingDates
  selectedDate?: string
  onSelectDate: (date: string) => void
  /** Prices of the selected version. */
  pricings?: IslandPricingItem[]
  /** Effective date of the selected version. */
  effectiveDate?: string
  isLoading?: boolean
  canActivate?: boolean
  isActivating?: boolean
  onActivate: (effectiveDate: string) => void
  isCreating?: boolean
  /** Should reject when saving fails, so the form stays open. */
  onCreate: (values: IslandsListPricingRequest) => Promise<unknown>
}

/** Browse saved island pricing versions, set one active, or create a new one. */
export function IslandPricingManager({
  versions,
  selectedDate,
  onSelectDate,
  pricings,
  effectiveDate,
  isLoading,
  canActivate = true,
  isActivating,
  onActivate,
  isCreating,
  onCreate,
}: IslandPricingManagerProps) {
  const [isEditing, setIsEditing] = useState(false)

  const dates = versions?.dates ?? []
  const rows = pricings ?? []

  async function handleCreate(values: IslandsListPricingRequest) {
    try {
      await onCreate(values)
      setIsEditing(false)
      onSelectDate(values.effective_date)
    } catch {
      // The mutation hook shows the error toast; keep the form open.
    }
  }

  if (isEditing) {
    const seeded = rows.length > 0
    return (
      <IslandPricingForm
        initialData={{
          pricings: seeded
            ? [...rows]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((row) => ({
                  island_id: String(row.island_id),
                  price: formatBound(row.general_price),
                }))
            : undefined,
        }}
        description={
          seeded
            ? `Starts from the ${formatPricingDate(effectiveDate)} prices. Adjust them, then save as a new version.`
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

        {rows.length > 0 && newPricingButton}
      </div>

      <IslandPricingTable
        pricings={rows}
        isLoading={isLoading}
        emptyAction={newPricingButton}
        emptyDescription={
          dates.length === 0
            ? "Create the first version by setting a price for each island."
            : "This version has no island prices."
        }
      />
    </div>
  )
}
