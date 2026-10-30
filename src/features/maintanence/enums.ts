export const maintanenceStatuses = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const

export const maintanenceTypes = ["routine", "repair", "inspection"] as const

export type MaintenanceStatus = (typeof maintanenceStatuses)[number]

export type MaintenanceType = (typeof maintanenceTypes)[number]
