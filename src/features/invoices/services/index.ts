import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  createInvoiceSchema,
  InvoiceSearchParams,
  voidInvoiceSchema,
} from "../schemas"
import { apiResponseTransform } from "@/lib/api-response-serializer"
import {
  getInvoices,
  voidInvoice,
  createInvoice,
  deleteInvoice,
  getInvoiceActivities,
  getInvoicePdf,
  sendInvoiceEmail,
  getInvoiceDetails,
  getInvoiceStatistics,
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

export const getInvoiceStatisticsFn = createServerFn().handler(async () => {
  const result = await getInvoiceStatistics()
  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }
  return { data: result.data! }
})

export const createInvoiceFn = createServerFn()
  .inputValidator(createInvoiceSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createInvoice(data))
  })

export const voidInvoiceFn = createServerFn({ method: "POST" })
  .inputValidator(voidInvoiceSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(voidInvoice(data))
    // The billing endpoint answers with a generic message
    return { ...result, message: "Invoice voided" }
  })

export const getInvoiceActivitiesFn = createServerFn({ method: "GET" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(getInvoiceActivities(data.id))
    return result.data ?? []
  })

export const deleteInvoiceFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(deleteInvoice(data.id))
    return { message: result.message ?? "Invoice deleted" }
  })

export const sendInvoiceEmailFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await sendInvoiceEmail(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, result.error.statusCode ?? 400)
    }
    return { data: result.data, message: result.message }
  })

export const getInvoicePdfFn = createServerFn({ method: "GET" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    try {
      const response = await getInvoicePdf(data.id)

      return new Response(response.data, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${data.id}-demo"}.pdf"`,
        },
      })
    } catch (error: any) {
      console.error("PDF generation error:", error?.response?.data || error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  })
