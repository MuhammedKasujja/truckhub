import { EntityId } from "@/schemas";

export type Role = {
  id: EntityId;
  name: string;
  description: string | null;
  permissions: string[];
};
