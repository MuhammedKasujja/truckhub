import { IslandsListPricingRequest, PricingSearchParams } from "../../schemas"
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
import { createCompanyIslandPricingQueryOptions } from "../../query-options"
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
import { useActivateCompanyPricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { EditIslandsPricingForm } from "./edit-islands-pricing-form"
import { IslandPricingTable } from "./island-pricing-table"
import { useCreateIslandPricing } from "../../hooks/use-island-pricing"

export function CompanyIslandsPricingConfigurationDialog() {
  const { data } = useCompanyPricingDates()
  const { activateCompanyPricing, isPending } = useActivateCompanyPricing()
  const { createIslandPricing } = useCreateIslandPricing()
  
  const [search, setSearch] = useState<PricingSearchParams>()
  const [view, setView] = useState<"list" | "edit">("list")

  const { data: companyPricings } = useQuery(
    createCompanyIslandPricingQueryOptions(search)
  )
  const referenceDate = companyPricings?.validFromDate

  async function handleSubmit(data: IslandsListPricingRequest) {
    createIslandPricing(data)
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
              <div className="flex items-baseline-last justify-between">
                <div className="grid grid-flow-col items-baseline-last gap-1.5">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="date">
                      Select pricing date{" "}
                      {data?.island.active_date === referenceDate && (
                        <Badge>Current</Badge>
                      )}
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
                        {data?.island.dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {data?.island.active_date !== referenceDate && (
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (search?.referenceDate)
                          activateCompanyPricing({
                            effectiveDate: search?.referenceDate,
                            source: "island",
                          })
                      }}
                    >
                      Set Active
                    </Button>
                  )}
                </div>
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
                data={companyPricings?.pricings}
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
                  pricings: companyPricings?.pricings ?? [],
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
