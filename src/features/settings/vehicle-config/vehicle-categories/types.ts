import { EntityId } from "@/schemas";
import { DataTableRowAction } from "@/types/data-table";

export type VehicleCategory = {
  id: EntityId;
  name: string;
  is_truck: boolean;
  image_url: string | null
  type: ''
};


export interface VehicleCategoryTableRowAction extends DataTableRowAction<
  VehicleCategory,
  "update" | "view"
> {}