import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type Role = {
  id: EntityId
  name: string
  description?: string | null | undefined
  permissions: []
}

export interface RoleTabaleRowActions extends DataTableRowAction<Role> {}
