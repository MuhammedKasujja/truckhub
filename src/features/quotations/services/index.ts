import { ApiError } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { createQuotationSchema, QuotationSearchParams } from "../schemas"
import { createQuotation, getQuotations, updateQuotation } from "./server"

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
