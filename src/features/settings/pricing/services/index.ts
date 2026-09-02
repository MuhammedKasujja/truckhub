import { createServerFn } from "@tanstack/react-start"
import {
  getIslandsPricings,
  getRouteTonnagePricing,
  createBatchIslandPricing,
  getDistanceTonnagePricing,
  createBatchLoadingPricing,
  getLoadingOffloadingFrees,
  createBatchDistancePricing,
  createBatchRouteTonnagePricing,
  updateBatchRouteTonnagePricing,
} from "./server"
import {
  IslandPricingRequest,
  IslandsListPricingSchema,
  ListDistancePricingSchema,
  LoadingOffloadingPricingSchema,
  BatchPricingPayloadUpdateSchema,
} from "../schemas"
import { ApiError } from "@/types"

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
    const result = await createBatchDistancePricing(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const getDistanceTonnagePricingFn = createServerFn().handler(
  async () => {
    const result = await getDistanceTonnagePricing()
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data!, message: result.message }
  }
)

export const getRouteTonnagePricingFn = createServerFn().handler(async () => {
  const result = await getRouteTonnagePricing()
  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }
  return { data: result.data!, message: result.message }
})

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
    const pricings = data.pricings.map((p) => ({
      island_id: p.island_id,
      price: p.priceRate,
      locations: p.locations.map((l) => l.value ??""),
    }))
    return createBatchIslandPricing({
      pricings,
      valid_from: data.validFromDate,
    })
  })

export const getIslandPricingsFn = createServerFn().handler(async () => {
  const { data } = await getIslandsPricings()
  if (data) {
    const pricings: IslandPricingRequest[] = data.pricings.map((p) => ({
      island_id: p.island_id,
      name: p.name,
      priceRate: p.general_price,
      locations: p.locations.map((l) => ({ value: l })),
    }))
    return { pricings, validFromDate: data.effective_date }
  }
  return undefined
})
