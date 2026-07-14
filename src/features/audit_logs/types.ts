import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type AuditLog = {
  id: EntityId
  user_id: EntityId
  resource_type: string
  source: string
  action: string
  created_at: string
  actor_name: string | null
}

export interface AuditLogTableRowAction extends DataTableRowAction<
  AuditLog,
  "view" | "delete"
> {}
