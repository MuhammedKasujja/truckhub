import { EntityId } from "@/schemas";

export type CarModel = {
  id: EntityId;
  name: string;
  car_brand_id: EntityId;
  vehicle_category_id: EntityId;
  consumption_rate: number;
  manufacture_year: number | null;
  car_brand: {
    id: EntityId
    name: string
  }
};
