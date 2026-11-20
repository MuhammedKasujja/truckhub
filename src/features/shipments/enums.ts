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
  // A delay report. A trip is never in this status: being late is worked out
  // from its dates (`is_delayed`, `delay_kind`)
  "delayed",
] as const

export type ShipmentHistoryStatus = (typeof shipmentHistoryStatuses)[number]

/** On the road. */
export const ON_TRIP_STATUSES: readonly ShipmentStatus[] = [
  "dispatched",
  "in_progress",
  "idle",
]

/** Not dispatched yet. */
export const PRE_TRIP_STATUSES: readonly ShipmentStatus[] = [
  "unassigned",
  "vehicle_assigned",
  "assigned",
]

/**
 * How a trip is behind its plan: not dispatched once its scheduled start day
 * ended, or still on the road after it was due back.
 */
export const shipmentDelayKinds = ["late_start", "overdue"] as const

export type ShipmentDelayKind = (typeof shipmentDelayKinds)[number]

export const shipmentDelayReasons = [
  "breakdown",
  "traffic",
  "weather",
  "loading",
  "customer",
  "border_customs",
  "documentation",
  "driver",
  "other",
] as const

export type ShipmentDelayReason = (typeof shipmentDelayReasons)[number]

export const reassignmentReasonsList = [
  "breakdown",
  "maintenance",
  "customer_request",
  "upgrade",
  "other",
] as const

export type ReassignmentReason = (typeof reassignmentReasonsList)[number]
