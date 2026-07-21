import z from "zod"
import { IDSchema } from "@/schemas"

export const RoleCreateSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
})

export const RoleUpdateSchema = z.object({
  id: IDSchema,
  ...RoleCreateSchema.partial().shape,
})

export type RoleCreateSchemaType = z.infer<typeof RoleCreateSchema>

export type RoleUpdateSchemaType = z.infer<typeof RoleUpdateSchema>
