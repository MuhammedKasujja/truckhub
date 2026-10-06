import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "../hooks/use-client-loading-fees"
import { EntityId } from "@/schemas"
import { Activity, useEffect, useState } from "react"
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
import { ClientPricingSearchParam } from "../schemas"
import { useClientPricingDates } from "../hooks/use-client"
import { useActivateClientLoadingPricing } from "../hooks/use-client-pricings"

type ClientPricingProps = {
  clientId: EntityId
}

export function ClientLoadingFeesModal({ clientId }: ClientPricingProps) {
  const [view, setView] = useState<"list" | "edit">("list")
  const [search, setSearch] = useState<ClientPricingSearchParam>({ clientId })

  const { data } = useClientLoadingOffloadingFees({ ...search })
  const { createClientLoadingFees, isPending } = useCreateClientLoadingFees()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    createClientLoadingFees({ ...values, client_id: clientId })
  }

  const { data: pricingConfig } = useClientPricingDates(clientId)

  useEffect(() => {
    setSearch({
      ...search,
      referenceDate: pricingConfig?.loading.active_date,
    })
  }, [pricingConfig])

  const { activatePricing } = useActivateClientLoadingPricing()

  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-5">
          <div className="grid grid-flow-col items-baseline-last gap-1.5">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">
                Select pricing date{" "}
                {pricingConfig?.loading.active_date ===
                  search.referenceDate && <Badge>Current</Badge>}
              </FieldLabel>
              <Select
                value={search.referenceDate}
                onValueChange={(date) => {
                  setSearch({ ...search, referenceDate: date })
                }}
              >
                <SelectTrigger className="min-w-48" id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingConfig?.loading.dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {pricingConfig?.loading.active_date !== search.referenceDate && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (search?.referenceDate) {
                    activatePricing({
                      clientId,
                      effectiveDate: search?.referenceDate,
                    })
                  }
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
          key={data?.effective_date}
          pricings={{
            pricings: data?.pricings ?? [],
            effective_date: data?.effective_date ?? new Date().toDateString(),
          }}
        />
      </Activity>
      <Activity mode={view == "edit" ? "visible" : "hidden"}>
        <LoadingOffloadingPricingForm
          isSubmitting={isPending}
          onSubmit={handleSubmit}
          onCancel={() => setView("list")}
        />
      </Activity>
    </>
  )
}
