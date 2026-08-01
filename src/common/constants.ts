export const NUMBERING_ENTITIES = [
  "Client",
  "Quotation",
  "Booking",
  "BookingLineItemUnit",
  "Invoice",
  "RideRequest",
  "Payment",
  "Driver",
  "Vehicle",
  "User",
] as const

export type EntityWithPatterns = (typeof NUMBERING_ENTITIES)[number]

export const ENTITY_NUMBER_PATTERNS: Record<EntityWithPatterns, string[]> = {
  Invoice: ["{counter}", "{year}", "{date}", "{month}"],
  Quotation: ["{counter}", "{year}", "{date}", "{month}"],
  Booking: ["{counter}", "{year}", "{date}", "{month}", "{client_short_name}"],
  RideRequest: ["{counter}", "{year}", "{date}", "{month}"],
  Payment: ["{counter}", "{year}", "{date}", "{month}"],
  Client: ["{counter}", "{year}", "{date}", "{month}"],
  Driver: ["{counter}", "{year}", "{date}", "{month}", "{day}"],
  Vehicle: ["{counter}", "{year}", "{date}", "{month}"],
  User: ["{counter}", "{year}", "{date}", "{month}"],
  BookingLineItemUnit: ["{counter}", "{year}", "{date}", "{month}"],
}

export const REPORT_TEMPLATES = [
  "invoice",
  "quotation",
  "log_sheet",
  "client_statement",
  "booking",
  "ride",
  "payment",
  "driver",
  "vehicle",
  "route_pricing",
  "loading_offloading_fees",
] as const

export type ReportTemplate = (typeof REPORT_TEMPLATES)[number]

/**
 * Allowed Entity Counter Padding
 *
 * [1, 2, 3, 4, 5, 6, 7, 8]
 */
export const ALLOWDED_NUMBER_COUNTER_PATTERNS = Array.from(
  { length: 8 },
  (_, index) => index + 1
)

/**
 *  Total idle time before logout [ 5 min]
 */
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // total idle time before logout [ 5 min]
/**
 * Show warning 4 min before logout. One minute less of `IDLE_TIMEOUT_MS`
 */
export const IDLE_PROMPT_MS = 4 * 60 * 1000 // show warning 4 min before logout
export const COUNTDOWN_SECONDS = (IDLE_TIMEOUT_MS - IDLE_PROMPT_MS) / 1000

export const DATE_FORMATS = [
  "DD/MMM/YYYY",
  "DD-MM-YYYY",
  "MMM D, YYYY",
  "YYYY-MM-DD",
]
