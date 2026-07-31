import { EntityId } from "@/schemas"
import { ShipmentStatus } from "./enums"
import { DataTableRowAction } from "@/types/data-table"
import { LineItemResponse } from "../quotations/schemas"

export type ShipmentLineItem = LineItemResponse & {
  scheduled_start: string
  scheduled_end: string
}

export type Shipment = {
  id: EntityId
  status: ShipmentStatus
  started_at?: Date
  driver?: { id: EntityId; number: string; fullname: string }
  vehicle?: { id: EntityId; number: string; plate_number: string }
  item: ShipmentLineItem
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
