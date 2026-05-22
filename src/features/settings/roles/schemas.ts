import z from "zod"

export const RoleCreateSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
})

export const RoleUpdateSchema = z.object({
  id: z.string(),
  ...RoleCreateSchema.partial().shape,
})

export type RoleCreateSchemaType = z.infer<typeof RoleCreateSchema>

export type RoleUpdateSchemaType = z.infer<typeof RoleUpdateSchema>
