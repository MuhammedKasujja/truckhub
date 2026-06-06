export const NUMBERING_ENTITIES = [
  "Booking",
  "RideRequest",
  "Payment",
  "Customer",
  "Driver",
  "Vehicle",
  "User",
] as const

export type EntityWithPatterns = (typeof NUMBERING_ENTITIES)[number]

export const ENTITY_NUMBER_PATTERNS: Record<EntityWithPatterns, string[]> = {
  Booking: ["{counter}", "{year}", "{date}", "{month}"],
  RideRequest: ["{counter}", "{year}", "{date}", "{month}"],
  Payment: ["{counter}", "{year}", "{date}", "{month}"],
  Customer: ["{counter}", "{year}", "{date}", "{month}"],
  Driver: ["{counter}", "{year}", "{date}", "{month}", "{day}"],
  Vehicle: ["{counter}", "{year}", "{date}", "{month}"],
  User: ["{counter}", "{year}", "{date}", "{month}"],
}
