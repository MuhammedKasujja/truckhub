import type { EntityId } from "@/schemas"
import type { DataTableRowAction } from "@/types/data-table"

export type AuditLog = {
  id: EntityId
  user_id: EntityId
  resource_type: string
  source: string
  action: string
  created_at: string
  before: Record<string, any> | null
  after: Record<string, any> | null
  actor_name: string | null
}

export interface AuditLogTableRowAction extends DataTableRowAction<
  AuditLog,
  "view" | "delete"
> {}
