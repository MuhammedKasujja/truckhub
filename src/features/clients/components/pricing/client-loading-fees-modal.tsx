import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "@/features/clients/hooks/use-client-loading-fees"
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
import { useClientPricingDates } from "@/features/clients/hooks/use-client"
import { useActivateClientLoadingPricing } from "@/features/clients/hooks/use-client-pricings"

type ClientPricingProps = {
  clientId: EntityId
}

export function ClientLoadingFeesModal({ clientId }: ClientPricingProps) {
  const [view, setView] = useState<"list" | "edit">("list")
  const [selectedDate, setSelectedDate] = useState<string>()

  const { data: pricingConfig } = useClientPricingDates(clientId)
  // Fall back to the active date so the tab opens on the current pricing
  const referenceDate = selectedDate ?? pricingConfig?.loading.active_date
  const isActive =
    !!referenceDate && pricingConfig?.loading.active_date === referenceDate

  const { data } = useClientLoadingOffloadingFees({ clientId, referenceDate })
  const { createClientLoadingFees, isPending: isCreating } =
    useCreateClientLoadingFees()
  const { activatePricing, isPending } = useActivateClientLoadingPricing()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    try {
      await createClientLoadingFees({ ...values, client_id: clientId })
      setView("list")
    } catch {
      // Error toast is shown by the mutation hook
    }
  }

  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-5">
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
                  {pricingConfig?.loading.dates.map((date) => (
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
                  activatePricing({ clientId, effectiveDate: referenceDate })
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
          isSubmitting={isCreating}
          onSubmit={handleSubmit}
          onCancel={() => setView("list")}
        />
      </Activity>
    </>
  )
}
