import { ActivatePricingInput } from "../schemas"
import { activateCompanyRoutePricingFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useActivateCompanyPricingBase = createEntityActionHook(
  activateCompanyRoutePricingFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

export function useActivateCompanyPricing() {
  const { isPending, execute } = useActivateCompanyPricingBase()

  function activateCompanyPricing(data: ActivatePricingInput) {
    return execute({ data })
  }
  return { isPending, activateCompanyPricing }
}
