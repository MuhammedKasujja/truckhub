import { EntityId } from "@/schemas";

export type Island = {
  id: EntityId;
  name: string;
  locations: string[]
};
