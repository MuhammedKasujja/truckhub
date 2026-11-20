import type { DocumentOwnerKind } from "./enums"
import type { EntityId } from "@/schemas"

/** A kind of document a company keeps, with the rules its files must meet. */
export type DocumentType = {
  id: EntityId
  /** Fixed once created, e.g. "medical_certificate". */
  code: string
  name: string
  owner_kind: DocumentOwnerKind
  is_required: boolean
  requires_expiry: boolean
  /** Only admins may open the files. */
  is_restricted: boolean
  allowed_content_types: string[]
  max_size_bytes: number
  is_active: boolean
  sort_order: number
}

/** A file attached to a record. Replaced and voided versions are kept. */
export type DocumentLink = {
  id: EntityId
  owner_kind: DocumentOwnerKind
  owner_id: EntityId
  document_type: DocumentType
  original_filename: string
  content_type: string
  size_bytes: number
  checksum_sha256: string | null
  uploaded_at: string
  /** A calendar date, "2027-03-31". */
  expires_on: string | null
  is_current: boolean
  voided_at: string | null
  void_reason: string | null
}
