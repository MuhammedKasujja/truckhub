import { EntityId } from "@/schemas";

export type VehicleType = {
  id: EntityId;
  name: string;
  is_truck: boolean;
};
