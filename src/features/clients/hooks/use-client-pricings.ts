import { ActivateClientPricing } from "../schemas"
import { activateClientPricingFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

type ActivatePricingDto = Omit<ActivateClientPricing, "source">

const useClientActivatePricingBase = createEntityActionHook(
  activateClientPricingFn,
  (invalidator, input) => {
    invalidator.clients.profile(input.data.clientId).invalidate()
  }
)

function useActivateClientPricing() {
  const { isPending, execute, isSuccess, error } =
    useClientActivatePricingBase()

  function mutate(data: ActivateClientPricing) {
    return execute({ data })
  }
  return {
    isPending,
    mutate,
    isSuccess,
    error,
  }
}

export function useActivateClientLoadingPricing() {
  const { mutate, ...rest } = useActivateClientPricing()

  function activatePricing(data: ActivatePricingDto) {
    return mutate({
      clientId: data.clientId,
      effectiveDate: data.effectiveDate,
      source: "loading",
    })
  }
  return { activatePricing, ...rest }
}

export function useActivateClientRoutePricing() {
  const { mutate, ...rest } = useActivateClientPricing()

  function activateRoutePricing(data: ActivatePricingDto) {
    return mutate({
      clientId: data.clientId,
      effectiveDate: data.effectiveDate,
      source: "route",
    })
  }
  return { activateRoutePricing, ...rest }
}
