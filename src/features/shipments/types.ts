import { EntityId } from "@/schemas"
import {
  ShipmentDelayKind,
  ShipmentDelayReason,
  ShipmentHistoryStatus,
  ShipmentStatus,
} from "./enums"
import { LineItemType } from "@/common/enums"
import { DataTableRowAction } from "@/types/data-table"
import { LineItemResponse } from "../quotations/schemas"

export type ShipmentLineItem = LineItemResponse & {
  scheduled_start: string | null
  scheduled_end: string | null
  car_brand_id: EntityId
  tonnage: string | null
  car_brand: { id: EntityId; name: string } | null
  car_model: { id: EntityId; name: string } | null
  vehicle_category: { id: EntityId; name: string; is_truck: boolean } | null
  service_id: EntityId | null
  car_model_id: EntityId | null
  vehicle_category_id: EntityId | null
  with_loaders: boolean | null
  with_driver: boolean | null
  estimated_fuel_rate_km: string | null
  locations: []
  vehicle_addons: string[]
  item_type: LineItemType
  /** The whole line's discount; a trip is billed its `discount_share` of it. */
  discount: string | null
  is_round_trip: boolean | null
  vehicle_year: string | null
}

export type ShipmentVehicleConsumption = {
  start_mileage: string
  end_mileage: string | undefined
  distance_km: string | undefined
  fuel_rate: string | null
  days: number | null
  fuel_used_litres: string | null
  consumed_fuel_rates: string[]
  total_fuel_charge: string | null
}

export type ShipmentHistory = {
  status: ShipmentHistoryStatus
  note: string | null
  changed_by: EntityId | null
  created_at: Date
}

/** One report that a trip is running late. A trip keeps every report made on it. */
export type ShipmentDelay = {
  id: EntityId
  reason: ShipmentDelayReason
  note: string | null
  /** When the trip was expected back as of this report */
  expected_end: string | null
  reported_by: EntityId | null
  reported_at: string
}

/** Another trip booked on the same vehicle before a delayed trip is due back. */
export type ShipmentDelayCollision = {
  trip_id: EntityId
  number: string | null
  status: ShipmentStatus
  starts_at: string
  ends_at: string | null
}

export type ShipmentDelayReport = {
  trip: Shipment
  affected_trips: ShipmentDelayCollision[]
}

export type Shipment = {
  id: EntityId
  number: string | null
  status: ShipmentStatus
  started_at?: Date
  actual_start?: Date
  actual_end?: Date
  contact_name?: string
  quotation_id: EntityId | null
  driver?: {
    id: EntityId
    number: string
    full_name: string
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
  /** This trip's part of its line's discount, as it will be invoiced. */
  discount_share: string
  updated_at: string
  /** Behind its plan right now. Worked out by the API from the trip's dates. */
  is_delayed: boolean
  delay_kind: ShipmentDelayKind | null
  /** When it is now expected back, if a delay was reported */
  expected_end: string | null
  history: ShipmentHistory[] | null
  /** Delay reports, oldest first. Only on a trip's details, not in lists. */
  delays?: ShipmentDelay[] | null
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
