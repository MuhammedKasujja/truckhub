export const DEFAULT_FITER_QUERY_PER_PAGE = 10

export const DEFAULT_ROUTE_TABLE_PRICING_ROWS = 10

export const CURRENCY_CODE = "UGX"

export const RideTypeList = [
  "passenger",
  "scheduled_passenger",
  "cargo",
  "scheduled_cargo",
] as const

export const PaymentModeList = [
  "cash",
  "mobile_money",
  "bank_transfer",
  "paypal",
  "credit_card",
] as const

export const PaymentStatuses = [
  "completed",
  "pending",
  "cancelled",
  "partially_refunded",
  "refunded",
  "failed",
] as const // ["pending", "processing", "paid", "failed"]

export const AuditLogSource = ["system", "user"] as const

export const ClientTypeList = ["normal", "premium"] as const

export const VehicleCylinderList = [2, 4, 5, 6, 8]

export const AxlesList = [2, 3, 4, 5, 6]

export const PaymentEntityList = ["ride", "booking"] as const

export type PaymentType = (typeof PaymentEntityList)[number]

export type ClientType = (typeof ClientTypeList)[number]

export const MAP_TILE_URL =
  "https://tiles.openfreemap.org/styles/bright/{z}/{x}/{y}.png"

export const MAP_LIGHT_STYLE_URL = "https://tiles.openfreemap.org/styles/bright"

export const MAP_DARK_STYLE_URL = "https://tiles.openfreemap.org/styles/dark"
