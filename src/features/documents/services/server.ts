import { toMaxSizeBytes } from "../schemas"
import type { DocumentOwnerKind } from "../enums"
import type {
  CreateDocumentTypeInput,
  DocumentOwner,
  UpdateDocumentTypeInput,
  UploadDocumentInput,
} from "../schemas"
import type { DocumentLink, DocumentType } from "../types"
import type { EntityId } from "@/schemas"
import { api } from "@/lib/api"
import * as apiClient from "@/lib/api-client"
import { objectToFormData } from "@/lib/form-utils"

const typesEndpoint = "/v1/document-types"

/** Where each kind of owner keeps its documents in the API. */
const OWNER_ENDPOINT: Partial<Record<DocumentOwnerKind, string>> = {
  driver: "/v1/drivers",
}

function ownerEndpoint(kind: DocumentOwnerKind) {
  const endpoint = OWNER_ENDPOINT[kind]
  if (!endpoint) throw new Error(`Documents are not available for ${kind}s yet`)
  return endpoint
}

const documentsEndpoint = ({ ownerKind, ownerId }: DocumentOwner) =>
  `${ownerEndpoint(ownerKind)}/${ownerId}/documents`

/* ----------------------------- document types ----------------------------- */

export async function getDocumentTypes(
  ownerKind: DocumentOwnerKind,
  activeOnly: boolean
) {
  return await apiClient.getFn<DocumentType[]>(
    `${typesEndpoint}?owner_kind=${ownerKind}&active_only=${activeOnly}`
  )
}

export async function createDocumentType(data: CreateDocumentTypeInput) {
  return await apiClient.postFn<DocumentType>(typesEndpoint, {
    code: data.code,
    name: data.name,
    owner_kind: data.ownerKind,
    is_required: data.isRequired,
    requires_expiry: data.requiresExpiry,
    is_restricted: data.isRestricted,
    allowed_content_types: data.allowedContentTypes,
    max_size_bytes: toMaxSizeBytes(data.maxSizeMb),
    sort_order: data.sortOrder,
  })
}

/** The code and the owner kind are fixed once a type exists. */
export async function updateDocumentType(data: UpdateDocumentTypeInput) {
  return await apiClient.patchFn<DocumentType>(`${typesEndpoint}/${data.id}`, {
    name: data.name,
    is_required: data.isRequired,
    requires_expiry: data.requiresExpiry,
    is_restricted: data.isRestricted,
    allowed_content_types: data.allowedContentTypes,
    max_size_bytes: toMaxSizeBytes(data.maxSizeMb),
    is_active: data.isActive,
    sort_order: data.sortOrder,
  })
}

/* -------------------------------- documents ------------------------------- */

/** Every version of every document, including replaced and voided ones. */
export async function getDocuments(owner: DocumentOwner, currentOnly: boolean) {
  return await apiClient.getFn<DocumentLink[]>(
    `${documentsEndpoint(owner)}?current_only=${currentOnly}`
  )
}

/** Current documents expiring within `withinDays`, and those already expired. */
export async function getExpiringDocuments(
  ownerKind: DocumentOwnerKind,
  withinDays: number
) {
  return await apiClient.getFn<DocumentLink[]>(
    `${ownerEndpoint(ownerKind)}/documents/expiring?within_days=${withinDays}`
  )
}

/** Replaces the owner's current document of the same type, keeping the old one. */
export async function uploadDocument(data: UploadDocumentInput) {
  const { ownerKind, ownerId, documentTypeCode, expiresOn, file } = data
  return await apiClient.postFn<DocumentLink>(
    documentsEndpoint({ ownerKind, ownerId }),
    objectToFormData({
      document_type_code: documentTypeCode,
      expires_on: expiresOn,
      file,
    })
  )
}

/** Withdraws a document. The file and its record are kept. */
export async function voidDocument(
  owner: DocumentOwner,
  linkId: EntityId,
  reason: string
) {
  return await apiClient.postFn<DocumentLink>(
    `${documentsEndpoint(owner)}/${linkId}/void`,
    { reason }
  )
}

/** The file itself. Every attempt is logged by the API, refused ones too. */
export async function downloadDocument(owner: DocumentOwner, linkId: EntityId) {
  return await api.get<ArrayBuffer>(
    `${documentsEndpoint(owner)}/${linkId}/download`,
    { responseType: "arraybuffer", timeout: 30000 }
  )
}
