import { CreditCardIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Activity, useState } from "react"
import { useCompanyPricingDates } from "../../hooks/use-company-pricing-dates"
import { createCompanyIslandPricingQueryOptions } from "../../query-options"
import { PricingVersionSelect } from "../pricing-version-select"
import { useCreateIslandPricing } from "../../hooks/use-island-pricing"
import { EditIslandsPricingForm } from "./edit-islands-pricing-form"
import { IslandPricingTable } from "./island-pricing-table"
import type {
  IslandsListPricingRequest,
  PricingSearchParams,
} from "../../schemas"
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
import { useActivateIslandPricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function CompanyIslandsPricingConfigurationDialog() {
  const { hasPermission } = usePermissions()
  const { data } = useCompanyPricingDates()
  const { activateIslandPricing, isPending } = useActivateIslandPricing()
  const { createIslandPricing } = useCreateIslandPricing()

  const [search, setSearch] = useState<PricingSearchParams>({})
  const [view, setView] = useState<"list" | "edit">("list")

  // Fall back to the active date so the sheet opens on the current pricing
  const referenceDate = search.referenceDate ?? data?.island.active_date

  const { data: companyPricings } = useQuery(
    createCompanyIslandPricingQueryOptions({ referenceDate })
  )

  async function handleSubmit(data: IslandsListPricingRequest) {
    try {
      await createIslandPricing(data)
      setView("list")
    } catch {
      // Error toast is shown by the mutation hook
    }
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
          <SheetTitle>Configure Islands pricing</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-5">
          <div className="space-y-4">
            <Activity mode={view == "list" ? "visible" : "hidden"}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <PricingVersionSelect
                  versions={data?.island}
                  selectedDate={referenceDate}
                  onSelectDate={(date) =>
                    setSearch({ ...search, referenceDate: date })
                  }
                  canActivate={hasPermission("config:pricing:activate")}
                  isActivating={isPending}
                  onActivate={(effectiveDate) =>
                    activateIslandPricing({ effectiveDate })
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
              <IslandPricingTable
                pricings={companyPricings?.pricings}
                // effectiveDate={
                //   companyPricings?.validFromDate ?? new Date().toDateString()
                // }
                // title={
                //   data?.route_tonnage.active_date === referenceDate
                //     ? "Current Company Pricing"
                //     : "Company Pricing"
                // }
              />
            </Activity>
            <Activity mode={view == "edit" ? "visible" : "hidden"}>
              <EditIslandsPricingForm
                initialData={{
                  pricings: [],
                  validFromDate:
                    companyPricings?.validFromDate ??
                    new Date().toLocaleDateString("en-CA"),
                }}
                onSubmit={(data) => handleSubmit(data)}
                onCancel={() => setView("list")}
              />
            </Activity>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
