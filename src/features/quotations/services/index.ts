import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  createQuotationSchema,
  QuotationSearchParams,
  updateQuotationSchema,
  quotationShipmentParams,
} from "../schemas"
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  getQuotationDetails,
  markQuotationExpired,
  markQuotationAccepted,
  markQuotationRejected,
  getQuotationReportPdf,
  getQuotationShipments,
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
  .inputValidator(updateQuotationSchema)
  .handler(async ({ data }) => {
    const result = await updateQuotation(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const markQuotationAcceptedFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await markQuotationAccepted(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const markQuotationRejectedFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await markQuotationRejected(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const markQuotationExpiredFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await markQuotationExpired(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const getQuotationDetailsFn = createServerFn({ method: "GET" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await getQuotationDetails(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }

    const quotation = result.data!
    const versions = quotation.versions.toReversed()
    const activeRevision = versions[0]

    return {
      data: { ...quotation, activeRevision, versions },
      message: result.message,
    }
  })

export const getQuotationReportPdfFn = createServerFn({ method: "GET" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    try {
      const response = await getQuotationReportPdf(data.id)

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

export const getQuotationShipmentsFn = createServerFn()
  .inputValidator(quotationShipmentParams)
  .handler(async ({ data }) => {
    const response = await getQuotationShipments(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })
