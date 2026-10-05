import { ApiError } from "@/types"
import * as apiClient from "@/lib/api-client"
import { ActivateClientPricing } from "../schemas"
import { LoadingOffloadingPricingResponse } from "@/features/settings/pricing/types"

export async function activateClientPricing(input: ActivateClientPricing) {
  const activateEndpoint = deriveActivatePricingRoute(input)
  return await apiClient.postFn<LoadingOffloadingPricingResponse>(
    activateEndpoint,
    { effective_date: input.effectiveDate }
  )
}

function deriveActivatePricingRoute(input: ActivateClientPricing) {
  if (input.source == "route") {
    return `/v1/pricing/routes/client/${input.clientId}/activate`
  } else if (input.source == "loading") {
    return `/v1/pricing/loading-offloading/client/${input.clientId}/activate`
  }
  throw new ApiError(`Pricing source: ${input.source} not allowed`, 400)
}
