import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { History } from "lucide-react"
import { IconSandbox } from "@tabler/icons-react"
import { useCompanyPricingDates } from "../../hooks/use-company-pricing-dates"
import { useCreateIslandPricing } from "../../hooks/use-island-pricing"
import { createCompanyIslandPricingQueryOptions } from "../../query-options"
import { IslandPricingManager } from "./island-pricing-manager"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useActivateIslandPricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export function CompanyIslandsPricingConfigurationDialog() {
  const { hasPermission } = usePermissions()
  const { data: dates } = useCompanyPricingDates()
  const { activateIslandPricing, isPending: isActivating } =
    useActivateIslandPricing()
  const { createIslandPricing, isPending: isCreating } =
    useCreateIslandPricing()
  const [selectedDate, setSelectedDate] = useState<string>()

  const versions = dates?.island
  // Fall back to the active date so the sheet opens on the current pricing
  const referenceDate = selectedDate ?? versions?.active_date

  const { data, isLoading } = useQuery(
    createCompanyIslandPricingQueryOptions({ referenceDate })
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" type="button">
          <History />
          Manage versions
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] gap-0 sm:max-w-none">
        <SheetHeader className="flex-row items-center gap-3.5 border-b px-5 py-4 pr-12">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <IconSandbox className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <SheetTitle className="text-base font-bold tracking-tight">
              Island pricing
            </SheetTitle>
            <SheetDescription>
              A price per island. Browse saved versions, set one active, or
              create a new one.
            </SheetDescription>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-5">
          <IslandPricingManager
            versions={versions}
            selectedDate={referenceDate}
            onSelectDate={setSelectedDate}
            pricings={data?.pricings}
            effectiveDate={data?.validFromDate}
            isLoading={isLoading}
            canActivate={hasPermission("config:pricing:activate")}
            isActivating={isActivating}
            onActivate={(effectiveDate) =>
              activateIslandPricing({ effectiveDate })
            }
            isCreating={isCreating}
            onCreate={createIslandPricing}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
