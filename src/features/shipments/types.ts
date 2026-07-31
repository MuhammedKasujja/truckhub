import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type Shipment = {
  id: EntityId
  status: string
  started_at?: Date
  driver?: { id: EntityId; number: string; name: string }
  vehicle?: { id: EntityId; number: string; plate_number: string }
  item: {
    scheduled_start: string
    scheduled_end: string
  }
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
