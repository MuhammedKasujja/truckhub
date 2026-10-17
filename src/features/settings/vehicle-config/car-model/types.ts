import { EntityId } from "@/schemas";
import { DataTableRowAction } from "@/types/data-table";

export type CarModel = {
  id: EntityId;
  name: string;
  car_brand_id: EntityId;
  vehicle_category_id: EntityId;
  consumption_rate: number;
  manufacture_year: number | null;
  image_url: string | null
  car_brand: {
    id: EntityId
    name: string
  }
};


export interface CarModelTableRowAction extends DataTableRowAction<
  CarModel,
  "update" | "view"
> {}