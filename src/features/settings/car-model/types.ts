import { EntityId } from "@/schemas";

export type CarModel = {
  id: EntityId;
  name: string;
  consumption_rate: number;
  manufacture_year: number | null;
};
