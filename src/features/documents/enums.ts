/** The kinds of record a document can be attached to. */
export const documentOwnerKinds = ["driver", "vehicle"] as const

export type DocumentOwnerKind = (typeof documentOwnerKinds)[number]

export const DOCUMENT_OWNER_LABEL: Record<DocumentOwnerKind, string> = {
  driver: "Drivers",
  vehicle: "Vehicles",
}

/** File types the API can recognise from a file's first bytes. */
export const documentContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type DocumentContentType = (typeof documentContentTypes)[number]

export const CONTENT_TYPE_LABEL: Record<DocumentContentType, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WEBP",
}

/**
 * A licence copy belongs to one licence: it is uploaded when the licence
 * changes, never on its own.
 */
export const LICENSE_COPY_CODE = "license_copy"
