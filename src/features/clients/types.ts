import { EntityId } from "@/schemas";

export type Customer = {
  id: EntityId;
  number: string
  name: string;
  short_name: string | undefined;
  phone: string;
  balance: string | number;
  paid_to_date: string | number;
  email: string;
  created_at: Date;
  updated_at: Date;
  has_pricing: boolean
};
