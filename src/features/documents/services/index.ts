import { createServerFn } from "@tanstack/react-start"
import { AxiosError } from "axios"
import {
  createDocumentTypeSchema,
  documentLinkSchema,
  expiringDocumentsSchema,
  listDocumentTypesSchema,
  listDocumentsSchema,
  updateDocumentTypeSchema,
  uploadDocumentSchema,
  voidDocumentSchema,
} from "../schemas"
import {
  createDocumentType,
  downloadDocument,
  getDocumentTypes,
  getDocuments,
  getExpiringDocuments,
  updateDocumentType,
  uploadDocument,
  voidDocument,
} from "./server"
import type { StatusCode } from "@/types"
import { apiResponseTransform } from "@/lib/api-response-serializer"
import { formInput } from "@/lib/form-utils"
import { ApiError } from "@/types"

export const getDocumentTypesFn = createServerFn({ method: "GET" })
  .validator(listDocumentTypesSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(
      getDocumentTypes(data.ownerKind, data.activeOnly)
    )
    return result.data ?? []
  })

export const createDocumentTypeFn = createServerFn({ method: "POST" })
  .validator(createDocumentTypeSchema)
  .handler(({ data }) => apiResponseTransform(createDocumentType(data)))

export const updateDocumentTypeFn = createServerFn({ method: "POST" })
  .validator(updateDocumentTypeSchema)
  .handler(({ data }) => apiResponseTransform(updateDocumentType(data)))

export const getDocumentsFn = createServerFn({ method: "GET" })
  .validator(listDocumentsSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(
      getDocuments(data, data.currentOnly)
    )
    return result.data ?? []
  })

export const getExpiringDocumentsFn = createServerFn({ method: "GET" })
  .validator(expiringDocumentsSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(
      getExpiringDocuments(data.ownerKind, data.withinDays)
    )
    return result.data ?? []
  })

/** Takes multipart form data: see `uploadDocumentSchema` for the fields. */
export const uploadDocumentFn = createServerFn({ method: "POST" })
  .validator(formInput(uploadDocumentSchema))
  .handler(({ data }) => apiResponseTransform(uploadDocument(data)))

export const voidDocumentFn = createServerFn({ method: "POST" })
  .validator(voidDocumentSchema)
  .handler(({ data }) =>
    apiResponseTransform(voidDocument(data, data.linkId, data.reason))
  )

/** The API's error body arrives as bytes on a binary request. */
function downloadErrorMessage(error: unknown) {
  if (error instanceof AxiosError && error.response?.data) {
    try {
      const text = new TextDecoder().decode(error.response.data as ArrayBuffer)
      const message = JSON.parse(text)?.error?.message
      if (typeof message === "string" && message) return message
    } catch {
      // Not JSON: fall through to the generic message
    }
  }
  return "Could not open the document"
}

/** Streams the file back with the API's content type and file name. */
export const downloadDocumentFn = createServerFn({ method: "GET" })
  .validator(documentLinkSchema)
  .handler(async ({ data }) => {
    try {
      const response = await downloadDocument(data, data.linkId)
      const headers = new Headers({
        "Content-Type":
          String(response.headers["content-type"] ?? "") ||
          "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      })
      const disposition = response.headers["content-disposition"]
      if (disposition) headers.set("Content-Disposition", String(disposition))

      return new Response(response.data, { status: 200, headers })
    } catch (error) {
      const status = error instanceof AxiosError ? error.status : undefined
      throw new ApiError(
        downloadErrorMessage(error),
        (status ?? 400) as StatusCode
      )
    }
  })
