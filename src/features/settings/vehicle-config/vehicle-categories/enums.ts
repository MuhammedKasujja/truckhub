export const vehicleTypesList = ["car", "van", "truck"] as const

export type VehicleType = (typeof vehicleTypesList)[number]
