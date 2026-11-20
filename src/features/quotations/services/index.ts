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
  sendQuotationEmail,
  getQuotationDetails,
  markQuotationExpired,
  markQuotationAccepted,
  markQuotationRejected,
  getQuotationReportPdf,
  getQuotationShipments,
  getQuotationActivities,
  markQuotationCancelled,
} from "./server"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getQuotationsFn = createServerFn()
  .validator(QuotationSearchParams)
  .handler(async ({ data }) => {
    const response = await getQuotations(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const createQuotationFn = createServerFn({ method: "POST" })
  .validator(createQuotationSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createQuotation(data))
  })

export const updateQuotationFn = createServerFn({ method: "POST" })
  .validator(updateQuotationSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(updateQuotation(data))
    return { data: result.data, message: result.message }
  })

export const markQuotationAcceptedFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(markQuotationAccepted(data.id))
    return { data: result.data, message: result.message }
  })

export const markQuotationRejectedFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(markQuotationRejected(data.id))
    return { data: result.data, message: result.message }
  })

export const sendQuotationEmailFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(sendQuotationEmail(data.id))
    return { data: result.data, message: result.message }
  })

export const markQuotationCancelledFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(markQuotationCancelled(data.id))
    return { data: result.data, message: result.message }
  })

export const markQuotationExpiredFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(markQuotationExpired(data.id))
    return { data: result.data, message: result.message }
  })

export const getQuotationDetailsFn = createServerFn({ method: "GET" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(getQuotationDetails(data.id))

    const quotation = result.data!
    const versions = quotation.versions.toReversed()
    const activeRevision = versions[0]

    return {
      data: { ...quotation, activeRevision, versions },
      message: result.message,
    }
  })

export const getQuotationActivitiesFn = createServerFn({ method: "GET" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(getQuotationActivities(data.id))
    return result.data ?? []
  })

export const getQuotationReportPdfFn = createServerFn({ method: "GET" })
  .validator(EntityIdSchema)
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
  .validator(quotationShipmentParams)
  .handler(async ({ data }) => {
    const response = await getQuotationShipments(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })
