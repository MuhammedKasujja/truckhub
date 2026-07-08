import z from "zod"
import { IDSchema } from "@/schemas"
import { SystemUser } from "@/features/users/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const UserCreateSchema = z.object({
  first_name: z.string().trim().min(3, "Required"),
  last_name: z.string().trim().min(3, "Required"),
  phone: z.string().optional().nullable(),
  email: z.email().trim(),
  username: z.string().trim().min(4, "Too short. should be at least 4 letters"),
  password: z.string().trim().min(3, "Required"),
  signature: z.string().trim().optional().nullable(),
})

export const UserUpdateSchema = z.object({
  id: IDSchema,
  ...UserCreateSchema.partial().shape,
})

export type UserCreateSchemaType = z.infer<typeof UserCreateSchema>

export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>

export const UserSearchParamsCache = z.object({
  sort: getSortingStateSchema<SystemUser>().default([
    { id: "created_at", desc: true },
  ]),
  filters: getFiltersStateSchema<SystemUser>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type UserListSearchParams = z.infer<typeof UserSearchParamsCache>

export const UserAssignRolesSchema = z.object({
  user_id: IDSchema,
  roles: z.array(IDSchema).min(1, "Required"),
})

export type UserAssignRolesType = z.infer<typeof UserAssignRolesSchema>
