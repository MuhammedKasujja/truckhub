export const vehicleStatuses = [
  "available",
  "reserved",
  "rented",
  "in_maintenance",
  "on_trip",
] as const

export type VehicleStatus = (typeof vehicleStatuses)[number]
