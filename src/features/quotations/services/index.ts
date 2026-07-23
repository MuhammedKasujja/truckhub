import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import { createQuotationSchema, QuotationSearchParams } from "../schemas"
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  getQuotationDetails,
  markQuotationExpired,
  markQuotationAccepted,
  markQuotationRejected,
} from "./server"

export const getQuotationsFn = createServerFn()
  .inputValidator(QuotationSearchParams)
  .handler(async ({ data }) => {
    const response = await getQuotations(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const createQuotationFn = createServerFn({ method: "POST" })
  .inputValidator(createQuotationSchema)
  .handler(async ({ data }) => {
    return createQuotation(data)
  })

export const updateQuotationFn = createServerFn({ method: "POST" })
  .inputValidator(createQuotationSchema)
  .handler(async ({ data }) => {
    return updateQuotation(data)
  })

export const markQuotationAcceptedFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return markQuotationAccepted(data.id)
  })

export const markQuotationRejectedFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return markQuotationRejected(data.id)
  })

export const markQuotationExpiredFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return markQuotationExpired(data.id)
  })

export const getQuotationDetailsFn = createServerFn({ method: "GET" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getQuotationDetails(data.id)
  })
