import { ApiError } from "@/types"
import { getInvoices } from "./server"
import { InvoiceSearchParams } from "../schemas"
import { createServerFn } from "@tanstack/react-start"

export const getInvoicesFn = createServerFn()
  .inputValidator(InvoiceSearchParams)
  .handler(async ({ data }) => {
    const response = await getInvoices(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })
