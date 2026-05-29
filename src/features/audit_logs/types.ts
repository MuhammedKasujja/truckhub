import { EntityId } from "@/schemas";

export type AuditLog = {
  id: EntityId;
  user_id: EntityId;
  resource_type: string;
  source: string;
  action: string;
  created_at: string;
  actor_name: string | null
};
