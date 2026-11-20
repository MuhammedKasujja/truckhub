import {
  RoleUpdateSchema,
  RoleCreateSchema,
  AssignPermissionsToRoleSchema,
} from "@/features/settings/permissions/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getRoles,
  updateRole,
  createRole,
  getRoleById,
  deleteRoleById,
  fetchPermissions,
  assignPermissionsToRole,
} from "./server"

export const getRolesFn = createServerFn().handler(async () => {
  return await getRoles()
})

export const getRoleFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getRoleById(data.id)
  })

export const deleteRoleFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteRoleById(data.id)
  })

export const updateRoleFn = createServerFn()
  .validator(RoleUpdateSchema)
  .handler(async ({ data }) => {
    return updateRole(data)
  })

export const createRoleFn = createServerFn()
  .validator(RoleCreateSchema)
  .handler(async ({ data }) => {
    return createRole(data)
  })

export const assignPermissionsToRoleFn = createServerFn()
  .validator(AssignPermissionsToRoleSchema)
  .handler(async ({ data }) => {
    return assignPermissionsToRole(data)
  })

export const fetchPermissionsFn = createServerFn().handler(async () => {
  return fetchPermissions()
})
