import { Activity, useState } from "react"
import { useActivateClientRoutePricing } from "../../hooks/use-client-pricings"
import { useClientPricingDates } from "../../hooks/use-client"
import {
  useClientRoutingPricing,
  useCreateClientRoutePricing,
} from "../../hooks/use-client-route-pricing"
import type { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import {
  PricingVersionSelect,
  RoutePricingDataGridForm,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

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
        <div className="flex flex-wrap items-end justify-between gap-3 pt-5 pb-4">
          <PricingVersionSelect
            versions={pricingConfig?.routes}
            selectedDate={referenceDate}
            onSelectDate={setSelectedDate}
            isActivating={isPending}
            onActivate={(effectiveDate) =>
              activateRoutePricing({ clientId, effectiveDate })
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
