import { EntityId } from "@/types";

export type Role = {
  id: EntityId;
  name: string;
  description: string | null;
  permissions: string[];
};
