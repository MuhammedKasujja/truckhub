import { CreditCardIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Activity, useState } from "react"
import { useCreateCompanyRoutePricing } from "../../hooks/use-company-routes-pricings"
import { useCompanyPricingDates } from "../../hooks/use-company-pricing-dates"
import { companyRoutePricingQueryOptions } from "../../query-options"
import { PricingVersionSelect } from "../pricing-version-select"
import { RoutePricingDataGridForm } from "./pricing-grid-form"
import { RouteTonnagePricingGrid } from "./route-tonnage-pricing"
import type { BatchPricingPayload, PricingSearchParams } from "../../schemas"
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
import { useActivateRoutePricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function CompanyRoutePricingConfigurationDialog() {
  const { hasPermission } = usePermissions()
  const { data } = useCompanyPricingDates()
  const { activateRoutePricing, isPending } = useActivateRoutePricing()
  const { createRoutePricing } = useCreateCompanyRoutePricing()
  const [search, setSearch] = useState<PricingSearchParams>({})
  const [view, setView] = useState<"list" | "edit">("list")

  // Fall back to the active date so the sheet opens on the current pricing
  const referenceDate = search.referenceDate ?? data?.route_tonnage.active_date

  const { data: companyPricings } = useQuery(
    companyRoutePricingQueryOptions({ referenceDate })
  )

  async function handleSubmit(values: BatchPricingPayload) {
    await createRoutePricing(values)
    setView("list")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"} type="button">
          <CreditCardIcon />
          View Configurations
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader className="border-b">
          <SheetTitle>Configure Route tonnage pricing</SheetTitle>
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
                  versions={data?.route_tonnage}
                  selectedDate={referenceDate}
                  onSelectDate={(date) =>
                    setSearch({ ...search, referenceDate: date })
                  }
                  canActivate={hasPermission("config:pricing:activate")}
                  isActivating={isPending}
                  onActivate={(effectiveDate) =>
                    activateRoutePricing({ effectiveDate })
                  }
                />
                <Button
                  variant={"secondary"}
                  type="button"
                  onClick={() => setView("edit")}
                >
                  <ActionIcon action="create" />
                  New Configuration
                </Button>
              </div>
              <RouteTonnagePricingGrid
                key={companyPricings?.effective_date}
                routes={companyPricings?.routes ?? []}
                effectiveDate={
                  companyPricings?.effective_date ?? new Date().toDateString()
                }
                title={
                  data?.route_tonnage.active_date === referenceDate
                    ? "Current Company Pricing"
                    : "Company Pricing"
                }
              />
            </Activity>
            <Activity mode={view == "edit" ? "visible" : "hidden"}>
              <RoutePricingDataGridForm
                onSubmit={handleSubmit}
                onCancel={() => setView("list")}
              />
            </Activity>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
