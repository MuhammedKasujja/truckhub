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
  Booking: ["{counter}", "{booking_id}", "{year}", "{date}", "{month}"],
  RideRequest: ["{counter}"],
  Payment: ["{counter}"],
  Customer: ["{counter}"],
  Driver: ["{counter}"],
  Vehicle: ["{counter}"],
  User: ["{counter}"],
}
