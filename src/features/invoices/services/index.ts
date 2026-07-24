import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"
import { InvoiceSearchParams } from "../schemas"
import { createServerFn } from "@tanstack/react-start"
import { getInvoiceDetails, getInvoices } from "./server"

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

export const getInvoiceDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await getInvoiceDetails(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data!, message: result.message }
  })
