import { CONTENT_TYPE_LABEL, LICENSE_COPY_CODE } from "./enums"
import type { DocumentLink, DocumentType } from "./types"

/** Documents within this many days of expiry are flagged. */
export const EXPIRING_WITHIN_DAYS = 30

export type ExpiryState = "none" | "valid" | "expiring" | "expired"

const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days from `today` to a calendar date; negative once it has passed. */
export const daysUntilDate = (date: string, today = new Date()) => {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number)
  const target = Date.UTC(year, month - 1, day)
  const from = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target - from) / DAY_MS)
}

/** A document is good through its expiry date and expired the day after. */
export const expiryState = (
  expiresOn: string | null | undefined,
  today = new Date()
): ExpiryState => {
  if (!expiresOn) return "none"
  const days = daysUntilDate(expiresOn, today)
  if (days < 0) return "expired"
  return days <= EXPIRING_WITHIN_DAYS ? "expiring" : "valid"
}

export const expiryLabel = (
  expiresOn: string | null | undefined,
  today = new Date()
) => {
  if (!expiresOn) return null
  const days = daysUntilDate(expiresOn, today)
  if (days < 0) {
    const ago = Math.abs(days)
    return `Expired ${ago} day${ago === 1 ? "" : "s"} ago`
  }
  if (days === 0) return "Expires today"
  if (days <= EXPIRING_WITHIN_DAYS) {
    return `Expires in ${days} day${days === 1 ? "" : "s"}`
  }
  return null
}

export const fileSizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// A type may allow a file type this build has no label for
const KNOWN_LABELS: Partial<Record<string, string>> = CONTENT_TYPE_LABEL

export const contentTypeLabel = (contentType: string) =>
  KNOWN_LABELS[contentType] ?? contentType

export const contentTypesLabel = (contentTypes: string[]) =>
  contentTypes.map(contentTypeLabel).join(", ")

/** Browsers show PDFs and images themselves; anything else is downloaded. */
export const canPreview = (contentType: string) =>
  contentType === "application/pdf" || contentType.startsWith("image/")

/** A voided document is withdrawn: it no longer counts as the current one. */
export const isVoided = (link: DocumentLink) => !!link.voided_at

/**
 * Why a file cannot be uploaded as this type, or null when it can. The API
 * checks again, from the file's actual bytes.
 */
export const fileProblem = (
  file: Pick<File, "size" | "type">,
  type: Pick<DocumentType, "allowed_content_types" | "max_size_bytes">
) => {
  if (file.size === 0) return "The file is empty"
  if (file.size > type.max_size_bytes) {
    return `The file is larger than ${fileSizeLabel(type.max_size_bytes)}`
  }
  // An unknown type is left for the API to identify
  if (file.type && !type.allowed_content_types.includes(file.type)) {
    return `Only ${contentTypesLabel(type.allowed_content_types)} files are accepted`
  }
  return null
}

export type DocumentRow = {
  type: DocumentType
  /** The version in force: current and not voided. */
  current: DocumentLink | undefined
  /** Replaced and voided versions, newest first. */
  history: DocumentLink[]
  /** Required, with nothing in force. */
  isMissing: boolean
  /** Uploaded with its licence, not on its own. */
  isManagedElsewhere: boolean
}

const newestFirst = (a: DocumentLink, b: DocumentLink) =>
  new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()

/**
 * One row per document type: what is in force, and what came before it.
 * Types that were switched off still get a row when they hold files, so
 * nothing uploaded disappears from view.
 */
export function buildDocumentRows(
  types: DocumentType[],
  links: DocumentLink[]
): DocumentRow[] {
  const byType = new Map<string, DocumentType>()
  for (const type of types) {
    if (type.is_active) byType.set(type.id, type)
  }
  for (const link of links) {
    if (!byType.has(link.document_type.id)) {
      byType.set(link.document_type.id, link.document_type)
    }
  }

  return [...byType.values()]
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((type) => {
      const own = links
        .filter((link) => link.document_type.id === type.id)
        .sort(newestFirst)
      const current = own.find((link) => link.is_current && !isVoided(link))
      return {
        type,
        current,
        history: own.filter((link) => link !== current),
        isMissing: type.is_active && type.is_required && !current,
        isManagedElsewhere: type.code === LICENSE_COPY_CODE,
      }
    })
}
