export const shipmentStatuses = [
  "unassigned",
  "assigned",
  "dispatched",
  "in_progress",
  "completed",
  "invoiced",
  "cancelled",
  "delayed",
] as const

export type ShipmentStatus = (typeof shipmentStatuses)[number]
