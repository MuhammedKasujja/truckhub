import { ActivatePricingInput } from "../schemas"
import { activateCompanyPricingFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

type ActivatePricingDto = Pick<ActivatePricingInput, "effectiveDate">

const useActivateCompanyPricingBase = createEntityActionHook(
  activateCompanyPricingFn,
  (invalidator) => {
    invalidator.settings.pricingPlans.all()
  }
)

function useActivateCompanyPricing() {
  const { isPending, execute } = useActivateCompanyPricingBase()

  function activateCompanyPricing(data: ActivatePricingInput) {
    return execute({ data })
  }
  return { isPending, activateCompanyPricing }
}

export function useActivateIslandPricing() {
  const { activateCompanyPricing, ...rest } = useActivateCompanyPricing()

  function activateIslandPricing(data: ActivatePricingDto) {
    return activateCompanyPricing({
      effectiveDate: data.effectiveDate,
      source: "island",
    })
  }
  return { activateIslandPricing, ...rest }
}

export function useActivateLoadingPricing() {
  const { activateCompanyPricing, ...rest } = useActivateCompanyPricing()

  function activateLoadingPricing(data: ActivatePricingDto) {
    return activateCompanyPricing({
      effectiveDate: data.effectiveDate,
      source: "loading",
    })
  }
  return { activateLoadingPricing, ...rest }
}

export function useActivateDistancePricing() {
  const { activateCompanyPricing, ...rest } = useActivateCompanyPricing()

  function activateDistancePricing(data: ActivatePricingDto) {
    return activateCompanyPricing({
      effectiveDate: data.effectiveDate,
      source: "distance",
    })
  }
  return { activateDistancePricing, ...rest }
}

export function useActivateRoutePricing() {
  const { activateCompanyPricing, ...rest } = useActivateCompanyPricing()

  function activateRoutePricing(data: ActivatePricingDto) {
    return activateCompanyPricing({
      effectiveDate: data.effectiveDate,
      source: "route",
    })
  }
  return { activateRoutePricing, ...rest }
}
