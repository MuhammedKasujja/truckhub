import { EntityId } from "@/schemas"
import { ShipmentStatus } from "./enums"
import { LineItemType } from "@/common/enums"
import { DataTableRowAction } from "@/types/data-table"
import { LineItemResponse } from "../quotations/schemas"

export type ShipmentLineItem = LineItemResponse & {
  scheduled_start: string
  scheduled_end: string
  car_brand_id: EntityId
  tonnage: number | null
  car_brand: { id: EntityId; name: string } | null
  car_model: { id: EntityId; name: string } | null
  vehicle_category: { id: EntityId; name: string; is_truck: boolean } | null
  service_id: EntityId | null
  car_model_id: EntityId | null
  with_loaders: boolean
  with_driver: boolean
  estimated_fuel_rate_km: string | null
  locations: []
  vehicle_addons: string[]
  item_type: LineItemType
  discount: string | null
  is_round_trip: boolean
  vehicle_year: string | null
}

export type ShipmentVehicleConsumption = {
  start_mileage: string
  end_mileage: string | undefined
  distance_km: string | undefined
  fuel_rate: string | null
  days: number | null
}

export type Shipment = {
  id: EntityId
  number: string | null
  status: ShipmentStatus
  started_at?: Date
  actual_start?: Date
  actual_end?: Date
  contact_name?: string
  quotation_id: EntityId
  driver?: {
    id: EntityId
    number: string
    fullname: string
    phone: string
    email: string
  }
  vehicle?: {
    id: EntityId
    number: string
    plate_number: string
    vehicle_year: string
    fuel_consumption_rate: string
  }
  item: ShipmentLineItem
  consumption: ShipmentVehicleConsumption | null
}

export interface ShipmentTableRowAction extends DataTableRowAction<
  Shipment,
  | "edit"
  | "view"
  | "dispatch"
  | "assign-vehicle"
  | "assign-driver"
  | "complete"
  | "finish"
> {}
