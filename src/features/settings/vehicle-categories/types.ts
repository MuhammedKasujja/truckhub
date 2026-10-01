import { EntityId } from "@/schemas";

export type VehicleCategory = {
  id: EntityId;
  name: string;
  is_truck: boolean;
};
