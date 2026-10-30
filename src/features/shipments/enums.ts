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
  "idel",
] as const

export type ShipmentStatus = (typeof shipmentStatuses)[number]

export const reassignmentReasonsList = [
  "breakdown",
  "maintenance",
  "customer_request",
  "upgrade",
  "other",
] as const

export type ReassignmentReason = (typeof reassignmentReasonsList)[number]
