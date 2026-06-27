import { createServerFn } from "@tanstack/react-start"
import {
  getIslandsPricings,
  createBatchIslandPricing,
  getDistanceTonnagePricing,
  createBatchLoadingPricing,
  getLoadingOffloadingFrees,
  createBatchDistancePricing,
  createBatchRouteTonnagePricing,
  updateBatchRouteTonnagePricing,
} from "./server"
import {
  IslandsListPricingSchema,
  ListDistancePricingSchema,
  LoadingOffloadingPricingSchema,
  BatchPricingPayloadUpdateSchema,
} from "../schemas"

export const updateBatchRouteTonnagePricingFn = createServerFn()
  .inputValidator(BatchPricingPayloadUpdateSchema)
  .handler(async ({ data }) => {
    return updateBatchRouteTonnagePricing(data)
  })

export const createBatchRoutePricingFn = createServerFn()
  .inputValidator(BatchPricingPayloadUpdateSchema)
  .handler(async ({ data }) => {
    return createBatchRouteTonnagePricing(data)
  })

export const createBatchDistancePricingFn = createServerFn()
  .inputValidator(ListDistancePricingSchema)
  .handler(async ({ data }) => {
    return createBatchDistancePricing(data)
  })

export const getDistanceTonnagePricingFn = createServerFn().handler(
  async () => {
    return getDistanceTonnagePricing()
  }
)

export const createBatchLoadingPricingFn = createServerFn()
  .inputValidator(LoadingOffloadingPricingSchema)
  .handler(async ({ data }) => {
    return createBatchLoadingPricing(data)
  })

export const getLoadingOffloadingFreesFn = createServerFn().handler(
  async () => {
    return getLoadingOffloadingFrees()
  }
)

export const createBatchIslandPricingsFn = createServerFn()
  .inputValidator(IslandsListPricingSchema)
  .handler(async ({ data }) => {
    const request = data.pricings.map((p) => ({
      name: p.name,
      price: p.priceRate,
      locations: p.locations.map((l) => l.value),
    }))
    return createBatchIslandPricing(request)
  })

export const getIslandPricingsFn = createServerFn().handler(async () => {
  return getIslandsPricings()
})
