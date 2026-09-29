import { createServerFn } from "@tanstack/react-start"
import {
  getIslandsPricings,
  getRouteTonnagePricing,
  getCompanyPricingDates,
  activateCompanyPricing,
  createBatchIslandPricing,
  getDistanceTonnagePricing,
  createBatchLoadingPricing,
  getLoadingOffloadingFrees,
  createBatchDistancePricing,
  createBatchRouteTonnagePricing,
  updateBatchRouteTonnagePricing,
  getActiveLoadingOffloadingFrees,
  getCompanyActiveDistancePricing,
} from "./server"
import {
  IslandPricingRequest,
  ActivatePricingSchema,
  IslandsListPricingSchema,
  PricingSearchParamsCache,
  ListDistancePricingSchema,
  LoadingOffloadingPricingSchema,
  ActivePricingSearchParamsCache,
  BatchPricingPayloadUpdateSchema,
} from "../schemas"
import { apiResponseTransform } from "@/lib/api-response-serializer"

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
    return await apiResponseTransform(createBatchDistancePricing(data))
  })

export const getDistanceTonnagePricingFn = createServerFn()
  .inputValidator(PricingSearchParamsCache)
  .handler(async ({ data }) => {
    return await apiResponseTransform(getDistanceTonnagePricing(data))
  })

export const getCompanyActiveDistancePricingFn = createServerFn()
  .handler(() => {
    return apiResponseTransform(getCompanyActiveDistancePricing())
  })

export const getRouteTonnagePricingFn = createServerFn()
  .inputValidator(PricingSearchParamsCache)
  .handler(async ({ data }) => {
    return await apiResponseTransform(getRouteTonnagePricing(data))
  })

export const createBatchLoadingPricingFn = createServerFn()
  .inputValidator(LoadingOffloadingPricingSchema)
  .handler(async ({ data }) => {
    return createBatchLoadingPricing(data)
  })

export const getLoadingOffloadingFreesFn = createServerFn()
  .inputValidator(PricingSearchParamsCache)
  .handler(async ({ data }) => {
    return getLoadingOffloadingFrees(data)
  })

export const getActiveLoadingOffloadingFreesFn = createServerFn()
  .inputValidator(ActivePricingSearchParamsCache)
  .handler(async ({ data }) => {
    return apiResponseTransform(getActiveLoadingOffloadingFrees(data))
  })

export const createBatchIslandPricingsFn = createServerFn()
  .inputValidator(IslandsListPricingSchema)
  .handler(async ({ data }) => {
    const pricings = data.pricings.map((p) => ({
      island_id: p.island_id,
      price: p.priceRate,
    }))
    return apiResponseTransform(
      createBatchIslandPricing({
        pricings,
        valid_from: data.validFromDate,
      })
    )
  })

export const getIslandPricingsFn = createServerFn()
  .inputValidator(PricingSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getIslandsPricings(data)
    if (response.data) {
      const pricings: IslandPricingRequest[] = response.data.pricings.map(
        (p) => ({
          island_id: p.island_id,
          name: p.name,
          priceRate: p.general_price,
          locations: p.locations.map((l) => ({ value: l })),
        })
      )
      return {
        pricings: response.data.pricings,
        validFromDate: response.data.effective_date,
      }
    }
    return undefined
  })

export const getCompanyPricingDatesFn = createServerFn().handler(
  async () => await getCompanyPricingDates()
)

export const activateCompanyPricingFn = createServerFn()
  .inputValidator(ActivatePricingSchema)
  .handler(({ data }) => apiResponseTransform(activateCompanyPricing(data)))
