import type { EntityId } from "@/schemas"
import type { DataTableRowAction } from "@/types/data-table"

export type Role = {
  id: EntityId
  name: string
  description?: string | null | undefined
  /** API permission names, e.g. "users:update". */
  permissions: string[]
}

export interface RoleTabaleRowActions extends DataTableRowAction<Role> {}
