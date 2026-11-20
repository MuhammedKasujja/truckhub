import { useState } from "react"
import type { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"
import type { EntityId } from "@/schemas"
import { LoadingFeesManager } from "@/features/settings/pricing/components"
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "@/features/clients/hooks/use-client-loading-fees"
import { useClientPricingDates } from "@/features/clients/hooks/use-client"
import { useActivateClientLoadingPricing } from "@/features/clients/hooks/use-client-pricings"

type ClientPricingProps = {
  clientId: EntityId
}

export function ClientLoadingFeesModal({ clientId }: ClientPricingProps) {
  const [selectedDate, setSelectedDate] = useState<string>()

  const { data: pricingDates } = useClientPricingDates(clientId)
  const versions = pricingDates?.loading
  // Fall back to the active date so the tab opens on the current pricing
  const referenceDate = selectedDate ?? versions?.active_date

  const { data, isLoading } = useClientLoadingOffloadingFees({
    clientId,
    referenceDate,
  })
  const { createClientLoadingFees, isPending: isCreating } =
    useCreateClientLoadingFees()
  const { activatePricing, isPending: isActivating } =
    useActivateClientLoadingPricing()

  return (
    <div className="pt-5">
      <LoadingFeesManager
        versions={versions}
        selectedDate={referenceDate}
        onSelectDate={setSelectedDate}
        pricing={data}
        isLoading={isLoading}
        isActivating={isActivating}
        onActivate={(effectiveDate) =>
          activatePricing({ clientId, effectiveDate })
        }
        isCreating={isCreating}
        onCreate={(values: LoadingOffloadingPricingRequest) =>
          createClientLoadingFees({ ...values, client_id: clientId })
        }
      />
    </div>
  )
}
