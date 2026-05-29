import { EntityId } from "@/schemas";

export type TaxRate = {
  id: EntityId;
  name: string;
  rate: string | number;
  description?: string | null | undefined;
};
