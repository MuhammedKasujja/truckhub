import { ApiError } from "@/types"
import { getQuotations } from "./server"
import { QuotationSearchParams } from "../schemas"
import { createServerFn } from "@tanstack/react-start"

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
