import { toast } from "sonner"
import { BatchPricingPayload, PricingSearchParams } from "../../schemas"
import { createBatchRoutePricingFn } from "../../services"
import { RoutePricingDataGridForm } from "./pricing-grid-form"
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
import { companyRoutePricingQueryOptions } from "../../query-options"
import { useQuery } from "@tanstack/react-query"
import { Activity, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RouteTonnagePricingGrid } from "./route-tonnage-pricing"
import { ActionIcon } from "@/components/icons"
import { FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"

export function CompanyRoutePricingConfigurationDialog() {
  const { data } = useCompanyPricingDates()
  const [search, setSearch] = useState<PricingSearchParams>()
  const [view, setView] = useState<"list" | "edit">("list")

  const { data: companyPricings } = useQuery(
    companyRoutePricingQueryOptions(search)
  )
  const referenceDate = companyPricings?.effective_date

  async function handleSubmit(data: BatchPricingPayload) {
    const { message, error, isSuccess } = await createBatchRoutePricingFn({
      data,
    })

    if (error) {
      toast.error(error.message)
    }

    if (isSuccess) {
      toast.success(message)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"}>
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
              <div className="flex items-baseline-last justify-between">
                <div className="grid grid-flow-col items-baseline-last gap-1.5">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="date">
                      Select pricing date{" "}
                      {data?.route_tonnage.active_date === referenceDate && (
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
                        {data?.route_tonnage.dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {data?.route_tonnage.active_date !== referenceDate && (
                    <Button type="button">Set Active</Button>
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
              <RouteTonnagePricingGrid
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
