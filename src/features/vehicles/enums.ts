export const vehicleStatues = [
  "available",
  "reserved",
  "rented",
  "maintenance",
  "on_trip",
] as const

export type VehicleStatus = (typeof vehicleStatues)[number]
