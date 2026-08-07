import { EntityId } from "@/schemas"
import { QuotationStatus } from "./enums"
import { DataTableRowAction } from "@/types/data-table"
import { EngineMode, LineItemType } from "@/common/enums"
import {
  LineItemResponse,
  SmallLineItemRequest,
  TruckLineItemRequest,
  LocationSourceResponse,
  DistanceLineItemRequest,
} from "./schemas"

interface LineItemOut {
  unit_price: number
  quantity: number
  subtotal: string
  line_total: string
  discount: string | null
  is_round_trip: boolean
  vehicle_category_id: EntityId
  estimated_fuel_rate_km: number | null
  engine_mode: EngineMode
  with_driver: boolean
}

export type ServiceLineItem = SmallLineItemRequest
export type RouteLineItem = TruckLineItemRequest
export type DistanceLineItem = DistanceLineItemRequest

type QuotationLineItemResponse = {
  is_round_trip: boolean
  unit_price: string
  subtotal: string
  line_total: string
  services: LocationSourceResponse
  vehicle_addons: {
    id: string
    name: string
  }[]
  item_type: LineItemType
  quantity: number
  with_driver: boolean
  with_loaders: boolean
  engine_mode: EngineMode
  discount: string| null
  vehicle_year: string | null
  service_id: EntityId | null
  car_brand_id: EntityId | null
  car_model_id: EntityId | null
  estimated_consumption_rate_km: number
}

export type QuotationVersion = {
  version_number: number
  subtotal: string
  total_amount: string
  discount_amount: string
  discount: string
  tax_amount: string
  valid_until: string | null
  purpose: string | undefined
  is_active: boolean
  start_date: string
  end_date: string
  revision_reason: string | null
  line_items: LineItemResponse[]
  tax_rates: { id: EntityId; tax_name: string; rate: number }[]
}

export type Quotation = {
  id: EntityId
  number: string
  status: QuotationStatus
  amount: string
  last_updated_at: Date
  created_at: Date
  versions: QuotationVersion[]
  client: {
    id: EntityId
    number: string
    name: string
  }
}

export interface QuotationTableRowAction extends DataTableRowAction<
  Quotation,
  "update" | "view"
> {}
