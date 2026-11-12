import { PricingSearchParams } from "../../schemas"
import { Button } from "@/components/ui/button"
import { CreditCardIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCompanyPricingDates } from "../../hooks/use-company-pricing-dates"
import { distancePricingQueryOptions } from "../../query-options"
import { useQuery } from "@tanstack/react-query"
import { Activity, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActionIcon } from "@/components/icons"
import { FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { useActivateDistancePricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { DistancePricingDatagridForm } from "./distance-pricing-schedule-form"
import { DistancePricingScheduleGrid } from "./distance-pricing-schedule-grid"
import { useCreateDistanceTonnage } from "../../hooks/use-distance-tonnage-pricing"
import { Can } from "@/components/has-permission"

export function CompanyDistancePricingConfigurationDialog() {
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
              <div className="flex items-baseline-last justify-between">
                <div className="grid grid-flow-col items-baseline-last gap-1.5">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="date">
                      Select pricing date{" "}
                      {referenceDate &&
                        data?.distance_tonnage.active_date ===
                          referenceDate && <Badge>Current</Badge>}
                    </FieldLabel>
                    <Select
                      value={referenceDate}
                      onValueChange={(date) => {
                        setSearch({ ...search, referenceDate: date })
                      }}
                    >
                      <SelectTrigger className="min-w-48" id="date">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.distance_tonnage.dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Can permission="config:pricing:activate">
                    {referenceDate &&
                      data?.distance_tonnage.active_date !== referenceDate && (
                        <Button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            activateDistancePricing({
                              effectiveDate: referenceDate,
                            })
                          }}
                        >
                          Set Active
                        </Button>
                      )}
                  </Can>
                </div>
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
