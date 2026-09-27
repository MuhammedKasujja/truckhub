import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import {
  LoadingOffloadingPricingRequest,
  PricingSearchParams,
} from "@/features/settings/pricing/schemas"
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "../hooks/use-client-loading-fees"
import { EntityId } from "@/schemas"
import { Activity, useState } from "react"
import { FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActionIcon } from "@/components/icons"
import { LoadingOffloadingPricingTable } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-offloading-pricing-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ClientPricingProps = {
  clientId: EntityId
}

export function ClientLoadingFeesModal({ clientId }: ClientPricingProps) {
  const [view, setView] = useState<"list" | "edit">("list")
  const [search, setSearch] = useState<PricingSearchParams>()

  const { data } = useClientLoadingOffloadingFees(clientId)
  const { createClientLoadingFees, isPending } = useCreateClientLoadingFees()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    createClientLoadingFees(values)
  }

  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-5">
          <div className="grid grid-flow-col items-baseline-last gap-1.5">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">
                Select pricing date{" "}
                {/* {data?.loading_offloading.active_date === referenceDate && ( */}
                <Badge>Current</Badge>
                {/* )} */}
              </FieldLabel>
              <Select
                // value={referenceDate}
                onValueChange={(date) => {
                  setSearch({ ...search, referenceDate: date })
                }}
              >
                <SelectTrigger className="min-w-48" id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* {data?.loading_offloading.dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>
            {/* {data?.loading_offloading.active_date !== referenceDate && ( */}
            <Button
              type="button"
              disabled={isPending}
              // onClick={() => {
              //   if (search?.referenceDate)
              //     activateLoadingPricing({
              //       effectiveDate: search?.referenceDate,
              //     })
              // }}
            >
              Set Active
            </Button>
            {/* )} */}
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
            pricings: data ?? [],
            effective_date: new Date().toDateString(),
          }}
          onSubmit={async (data) => {}}
        />
      </Activity>
      <Activity mode={view == "edit" ? "visible" : "hidden"}>
        <LoadingOffloadingPricingForm
          isSubmitting={isPending}
          onSubmit={handleSubmit}
          onCancel={()=> setView("list")}
        />
      </Activity>
    </>
  )
}
