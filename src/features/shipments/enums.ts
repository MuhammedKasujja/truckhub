export const shipmentStatuses = [
  "unassigned",
  "vehicle_assigned",
  "assigned",
  "dispatched",
  "in_progress",
  "completed",
  "captured_details",
  "invoiced",
  "cancelled",
  "delayed",
  "idle",
] as const

export type ShipmentStatus = (typeof shipmentStatuses)[number]

/**
 * What a trip's activity timeline can show: the statuses, plus events that
 * are recorded in the history without changing the trip's status.
 */
export const shipmentHistoryStatuses = [
  ...shipmentStatuses,
  "vehicle_reassigned",
] as const

export type ShipmentHistoryStatus = (typeof shipmentHistoryStatuses)[number]

/** On the road. */
export const ON_TRIP_STATUSES: readonly ShipmentStatus[] = [
  "dispatched",
  "in_progress",
  "delayed",
  "idle",
]

export const reassignmentReasonsList = [
  "breakdown",
  "maintenance",
  "customer_request",
  "upgrade",
  "other",
] as const

export type ReassignmentReason = (typeof reassignmentReasonsList)[number]
