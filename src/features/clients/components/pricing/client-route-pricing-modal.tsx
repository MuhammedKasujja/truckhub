import {
  RoutePricingDataGridForm,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { toast } from "sonner"
import { createClientBatchRoutePricingFn } from "../../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { Activity, useEffect, useState } from "react"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActivateClientRoutePricing } from "../../hooks/use-client-pricings"
import { useClientPricingDates } from "../../hooks/use-client"
import { ClientPricingSearchParam } from "../../schemas"
import { useClientRoutingPricing } from "../../hooks/use-client-route-pricing"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  const queryInvaidator = useQueryInvalidator()
  const [view, setView] = useState<"list" | "edit">("list")
  const [search, setSearch] = useState<ClientPricingSearchParam>({ clientId })

  const { data: pricingConfig } = useClientPricingDates(clientId)
  const { data: pricing } = useClientRoutingPricing(search)

  useEffect(() => {
    setSearch({
      ...search,
      referenceDate: pricingConfig?.routes.active_date,
    })
  }, [pricingConfig])

  const { activateRoutePricing, isPending } = useActivateClientRoutePricing()

  async function handleSubmit(values: BatchPricingPayload) {
    const { error, isSuccess, message } = await createClientBatchRoutePricingFn(
      {
        data: { ...values, client_id: clientId },
      }
    )
    if (isSuccess && message) {
      toast.success(message)
      queryInvaidator.clients.profile(clientId).routePricing.invalidate()
    }
    if (error) {
      toast.error(error.message)
    }
  }
  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-4">
          <div className="grid grid-flow-col items-baseline-last gap-1.5">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">
                Select pricing date{" "}
                {pricingConfig?.routes.active_date ===
                  search?.referenceDate && <Badge>Current</Badge>}
              </FieldLabel>
              <Select
                value={search?.referenceDate}
                onValueChange={(date) => {
                  setSearch({ clientId, referenceDate: date })
                }}
              >
                <SelectTrigger className="min-w-48" id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingConfig?.routes.dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {pricingConfig?.routes.active_date !== search?.referenceDate && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (search?.referenceDate)
                    activateRoutePricing({
                      clientId,
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
            New Configuration
          </Button>
        </div>
        <RouteTonnagePricingGrid
          key={pricing?.effective_date}
          routes={pricing?.routes ?? []}
          effectiveDate={new Date().toDateString()}
          title={"Current Client Pricing"}
        />
      </Activity>
      <Activity mode={view == "edit" ? "visible" : "hidden"}>
        <RoutePricingDataGridForm
          onSubmit={handleSubmit}
          onCancel={() => setView("list")}
        />
      </Activity>
    </>
  )
}
