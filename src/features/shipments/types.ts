import { EntityId } from "@/schemas"
import { ShipmentStatus } from "./enums"
import { DataTableRowAction } from "@/types/data-table"
import { LineItemResponse } from "../quotations/schemas"

export type ShipmentLineItem = LineItemResponse & {
  scheduled_start: string
  scheduled_end: string
  car_brand: { id: EntityId; name: string } | null
  car_model: { id: EntityId; name: string } | null
  vehicle_category: { id: EntityId; name: string; is_truck: boolean } | null
}

export type ShipmentVehicleConsumption = {
  start_mileage: string | number
  end_mileage: number | undefined
  distance_km: string | number | null
  fuel_rate: string | number | null
  days: number | null
}

export type Shipment = {
  id: EntityId
  number: string | null
  status: ShipmentStatus
  started_at?: Date
  actual_start?: Date
  actual_end?: Date
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
    fuel_consumption_rate: string | number
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
