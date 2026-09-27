import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { toast } from "sonner"
import { createClientBatchRoutePricingFn } from "../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  const queryInvaidator = useQueryInvalidator()

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
          <RoutePricingDataGridForm onSubmit={handleSubmit} />
       
  )
}
