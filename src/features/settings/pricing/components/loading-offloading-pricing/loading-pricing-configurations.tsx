import { toast } from "sonner"
import {
  LoadingOffloadingPricingRequest,
  PricingSearchParams,
} from "../../schemas"
import { createBatchLoadingPricingFn } from "../../services"
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
import { createCompanyLoadingFreesQueryOptions } from "../../query-options"
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
import { useActivateLoadingPricing } from "@/features/settings/pricing/hooks/use-activate-pricings"
import { LoadingOffloadingPricingForm } from "./loading-offloading-pricing-form"
import { LoadingOffloadingPricingTable } from "./loading-offloading-pricing-table"

export function CompanyLoadingPricingConfigurationDialog() {
  const { data } = useCompanyPricingDates()
  const { activateLoadingPricing, isPending } = useActivateLoadingPricing()
  const [search, setSearch] = useState<PricingSearchParams>()
  const [view, setView] = useState<"list" | "edit">("list")

  const { data: companyPricings } = useQuery(
    createCompanyLoadingFreesQueryOptions(search)
  )
  const referenceDate =
    search?.referenceDate ?? companyPricings?.data?.effective_date

  async function handleSubmit(data: LoadingOffloadingPricingRequest) {
    const { message, error } = await createBatchLoadingPricingFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(message)
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
          <SheetTitle>Configure Loading and offloading fees</SheetTitle>
          <SheetDescription>
            Define tonnage ranges and CBM with prices.
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
                      {data?.loading_offloading.active_date ===
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
                        {data?.loading_offloading.dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {data?.loading_offloading.active_date !== referenceDate && (
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (search?.referenceDate)
                          activateLoadingPricing({
                            effectiveDate: search?.referenceDate,
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
                  New Pricing
                </Button>
              </div>
              <LoadingOffloadingPricingTable
                pricings={{
                  pricings: companyPricings?.data?.pricings,
                  effective_date:
                    companyPricings?.data?.effective_date ??
                    new Date().toDateString(),
                }}
                title={
                  data?.route_tonnage.active_date === referenceDate
                    ? "Current Company Pricing"
                    : "Company Pricing"
                }
              />
            </Activity>
            <Activity mode={view == "edit" ? "visible" : "hidden"}>
              <LoadingOffloadingPricingForm
                initialData={{
                  pricings: [],
                  effective_date: new Date().toDateString(),
                }}
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
