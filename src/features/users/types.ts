import { EntityId } from "@/schemas";

export type SystemUser = {
  id: EntityId;
  number: string | undefined;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | undefined;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};
