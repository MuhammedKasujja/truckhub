import { createServerFn } from "@tanstack/react-start"
import {
  getDistanceTonnagePricing,
  createBatchDistancePricing,
  createBatchRouteTonnagePricing,
  updateBatchRouteTonnagePricing,
} from "./server"
import {
  ListDistancePricingSchema,
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
