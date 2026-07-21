import {
  RoleUpdateSchema,
  RoleCreateSchema,
} from "@/features/settings/roles/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getRoles,
  createRole,
  updateRole,
  getRoleById,
  deleteRoleById,
} from "./server"

export const getRolesFn = createServerFn().handler(async () => {
  const { data, error } = await getRoles()
  if (error) {
    throw new Error(error.message)
  }
  return data
})

export const getRoleFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getRoleById(data.id)
  })

export const deleteRoleFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteRoleById(data.id)
  })

export const updateRoleFn = createServerFn()
  .inputValidator(RoleUpdateSchema)
  .handler(async ({ data }) => {
    return updateRole(data)
  })

export const createRoleFn = createServerFn()
  .inputValidator(RoleCreateSchema)
  .handler(async ({ data }) => {
    return createRole(data)
  })
