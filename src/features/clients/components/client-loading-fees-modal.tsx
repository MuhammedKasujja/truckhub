import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "../hooks/use-client-loading-fees"
import { EntityId } from "@/schemas"

type ClientPricingProps = {
  clientId: EntityId
}

export function ClientLoadingFeesModal({ clientId }: ClientPricingProps) {
  const { data } = useClientLoadingOffloadingFees(clientId)
  const { createClientLoadingFees, isPending } = useCreateClientLoadingFees()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    createClientLoadingFees(values)
  }

  return (
    <LoadingOffloadingPricingForm
      initialData={
        data
          ? {
              pricings: data,
              client_id: clientId,
              effective_date: data.effective_date,
            }
          : undefined
      }
      isSubmitting={isPending}
      onSubmit={handleSubmit}
    />
  )
}
