import {
  RoutePricingDataGridForm,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { Activity, useState } from "react"
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
import {
  useClientRoutingPricing,
  useCreateClientRoutePricing,
} from "../../hooks/use-client-route-pricing"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  const [view, setView] = useState<"list" | "edit">("list")
  const [selectedDate, setSelectedDate] = useState<string>()

  const { data: pricingConfig } = useClientPricingDates(clientId)
  // Fall back to the active date so the tab opens on the current pricing
  const referenceDate = selectedDate ?? pricingConfig?.routes.active_date
  const isActive =
    !!referenceDate && pricingConfig?.routes.active_date === referenceDate

  const { data: pricing } = useClientRoutingPricing({
    clientId,
    referenceDate,
  })

  const { activateRoutePricing, isPending } = useActivateClientRoutePricing()
  const { createClientRoutePricing } = useCreateClientRoutePricing()

  async function handleSubmit(values: BatchPricingPayload) {
    // Errors propagate to the grid form, which shows them inline
    await createClientRoutePricing({ ...values, client_id: clientId })
    setView("list")
  }

  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-4">
          <div className="grid grid-flow-col items-baseline-last gap-1.5">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">
                Select pricing date {isActive && <Badge>Current</Badge>}
              </FieldLabel>
              <Select value={referenceDate} onValueChange={setSelectedDate}>
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
            {referenceDate && !isActive && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                  activateRoutePricing({
                    clientId,
                    effectiveDate: referenceDate,
                  })
                }
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
          effectiveDate={pricing?.effective_date ?? new Date().toDateString()}
          title={isActive ? "Current Client Pricing" : "Client Pricing"}
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
