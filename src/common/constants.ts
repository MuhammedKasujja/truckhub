export const ENTITY_NUMBER_PATTERNS = [
  "Booking",
  "RideRequest",
  "Payment",
  "Customer",
  "Driver",
  "Vehicle",
  "User",
] as const

export type EntityWithPatterns = (typeof ENTITY_NUMBER_PATTERNS)[number];