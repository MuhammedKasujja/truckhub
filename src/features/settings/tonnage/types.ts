import { EntityId } from "@/schemas";

export type Tonnage = {
  id: EntityId;
  tonnage: string;
  tonnage_min: number;
  tonnage_max: number;
};
