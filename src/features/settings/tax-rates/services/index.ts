import {
  TaxRateUpdateSchema,
  TaxRateCreateSchema,
} from "@/features/settings/tax-rates/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  getTaxRateById,
  deleteTaxRateById,
} from "./server"

export const getTaxRatesFn = createServerFn()
  .handler(async () => {
    return await getTaxRates()
  })

export const getTaxRateFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getTaxRateById(data.id)
  })

export const deleteTaxRateFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteTaxRateById(data.id)
  })

export const updateTaxRateFn = createServerFn()
  .inputValidator(TaxRateUpdateSchema)
  .handler(async ({ data }) => {
    return updateTaxRate(data)
  })

export const createTaxRateFn = createServerFn()
  .inputValidator(TaxRateCreateSchema)
  .handler(async ({ data }) => {
    return createTaxRate(data)
  })
