import { CreditCardIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Activity, useState } from "react"
import { useCompanyPricingDates } from "../../hooks/use-company-pricing-dates"
import { distancePricingQueryOptions } from "../../query-options"
import { PricingVersionSelect } from "../pricing-version-select"
import { useCreateDistanceTonnage } from "../../hooks/use-distance-tonnage-pricing"
import { DistancePricingDatagridForm } from "./distance-pricing-schedule-form"
import { DistancePricingScheduleGrid } from "./distance-pricing-schedule-grid"
import type { PricingSearchParams } from "../../schemas"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ActionIcon } from "@/components/icons"
import { useActivateDistancePricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function CompanyDistancePricingConfigurationDialog() {
  const { hasPermission } = usePermissions()
  const { data } = useCompanyPricingDates()
  const { activateDistancePricing, isPending } = useActivateDistancePricing()
  const { createDistanceTonnage } = useCreateDistanceTonnage()

  const [search, setSearch] = useState<PricingSearchParams>({})
  const [view, setView] = useState<"list" | "edit">("list")

  // Fall back to the active date so the sheet opens on the current pricing
  const referenceDate =
    search.referenceDate ?? data?.distance_tonnage.active_date

  const { data: companyPricings } = useQuery(
    distancePricingQueryOptions({ referenceDate })
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button">
          <CreditCardIcon />
          View Configurations
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader className="border-b">
          <SheetTitle>Configure Distance pricing</SheetTitle>
          <SheetDescription>
            Define tonnage bands then fill prices per route in the grid. Columns
            are generated automatically from your band definitions.
          </SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-5">
          <div className="space-y-4">
            <Activity mode={view == "list" ? "visible" : "hidden"}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <PricingVersionSelect
                  versions={data?.distance_tonnage}
                  selectedDate={referenceDate}
                  onSelectDate={(date) =>
                    setSearch({ ...search, referenceDate: date })
                  }
                  canActivate={hasPermission("config:pricing:activate")}
                  isActivating={isPending}
                  onActivate={(effectiveDate) =>
                    activateDistancePricing({ effectiveDate })
                  }
                />
                <Button
                  variant={"secondary"}
                  type="button"
                  onClick={() => setView("edit")}
                >
                  <ActionIcon action="create" />
                  New Distance Pricing
                </Button>
              </div>
              <DistancePricingScheduleGrid
                key={companyPricings?.effective_date}
                pricings={companyPricings?.pricings ?? []}
                initialDate={
                  companyPricings?.effective_date ?? new Date().toDateString()
                }
              />
            </Activity>
            <Activity mode={view == "edit" ? "visible" : "hidden"}>
              <DistancePricingDatagridForm
                initialDate={new Date()}
                onCancel={() => setView("list")}
                onSave={async (pricings, _, effectiveDate) => {
                  try {
                    await createDistanceTonnage({
                      pricings,
                      effectiveDate: effectiveDate,
                    })
                    setView("list")
                  } catch {
                    // Error toast is shown by the mutation hook
                  }
                }}
              />
            </Activity>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
