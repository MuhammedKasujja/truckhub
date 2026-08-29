export const vehicleStatuses = [
  "available",
  "reserved",
  "rented",
  "maintenance",
  "on_trip",
] as const

export type VehicleStatus = (typeof vehicleStatuses)[number]
