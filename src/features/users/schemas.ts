import z from "zod"
import { SystemUser } from "@/features/users/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const UserCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
})

export const UserUpdateSchema = z.object({
  id: z.number(),
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
