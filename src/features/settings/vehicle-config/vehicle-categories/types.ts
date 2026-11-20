import type { VehicleType } from "./enums"
import type { EntityId } from "@/schemas"
import type { DataTableRowAction } from "@/types/data-table"

export type VehicleCategory = {
  id: EntityId
  name: string
  is_truck: boolean
  image_url: string | null
  parent_category_id: EntityId | null
  type: VehicleType
  display_name: string | null
  parent: {
    id: EntityId
    name: string
    type: VehicleType
  } | null
}

export interface VehicleCategoryTableRowAction extends DataTableRowAction<
  VehicleCategory,
  "update" | "view"
> {}
