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
