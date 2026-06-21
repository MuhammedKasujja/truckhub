import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type SystemUser = {
  id: EntityId
  number: string | undefined
  name: string
  first_name: string
  last_name: string
  email: string
  phone: string | undefined
  is_admin: boolean
  username: string | undefined
  created_at: string
  last_login: string | null
  updated_at: string
  roles: {
    id: EntityId
    name: string
    description?: string
  }[]
}

export interface UserDataTableRowAction extends DataTableRowAction<
  SystemUser,
  "update" | "delete" | "assign-permissions"
> {}
