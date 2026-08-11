import { ApiError } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import { createInvoiceSchema, InvoiceSearchParams } from "../schemas"
import {
  getInvoices,
  createInvoice,
  getInvoiceDetails,
  getInvoicesByQuery,
} from "./server"

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

export const getInvoicesByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getInvoicesByQuery(data)
  })

export const createInvoiceFn = createServerFn()
  .inputValidator(createInvoiceSchema)
  .handler(async ({ data }) => {
    const result = await createInvoice(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })
