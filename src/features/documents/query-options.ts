import { queryOptions } from "@tanstack/react-query"
import { EXPIRING_WITHIN_DAYS } from "./format"
import {
  getDocumentTypesFn,
  getDocumentsFn,
  getExpiringDocumentsFn,
} from "./services"
import type { DocumentOwnerKind } from "./enums"
import type { DocumentOwner } from "./schemas"

export const documentQueryKeys = {
  all: () => ["documents"] as const,
  types: () => [...documentQueryKeys.all(), "types"] as const,
  typeList: (ownerKind: DocumentOwnerKind, activeOnly: boolean) =>
    [...documentQueryKeys.types(), ownerKind, { activeOnly }] as const,
  owners: () => [...documentQueryKeys.all(), "owner"] as const,
  owner: ({ ownerKind, ownerId }: DocumentOwner) =>
    [...documentQueryKeys.owners(), ownerKind, ownerId] as const,
  expiring: (ownerKind: DocumentOwnerKind, withinDays: number) =>
    [...documentQueryKeys.all(), "expiring", ownerKind, withinDays] as const,
} as const

export const documentTypesQueryOptions = (
  ownerKind: DocumentOwnerKind,
  activeOnly = false
) =>
  queryOptions({
    queryKey: documentQueryKeys.typeList(ownerKind, activeOnly),
    queryFn: () => getDocumentTypesFn({ data: { ownerKind, activeOnly } }),
  })

/** Every version of an owner's documents, replaced and voided ones included. */
export const ownerDocumentsQueryOptions = (owner: DocumentOwner) =>
  queryOptions({
    queryKey: documentQueryKeys.owner(owner),
    queryFn: () => getDocumentsFn({ data: { ...owner, currentOnly: false } }),
  })

export const expiringDocumentsQueryOptions = (
  ownerKind: DocumentOwnerKind,
  withinDays = EXPIRING_WITHIN_DAYS
) =>
  queryOptions({
    queryKey: documentQueryKeys.expiring(ownerKind, withinDays),
    queryFn: () => getExpiringDocumentsFn({ data: { ownerKind, withinDays } }),
  })
