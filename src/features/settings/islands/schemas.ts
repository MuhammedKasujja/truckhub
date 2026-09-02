import z from "zod"
import { IDSchema } from "@/schemas"

export const islandCreateSchema = z.object({
  name: z.string(),
  locations: z.array(z.string()).min(1, "Required")
})

export const islandUpdateSchema = z.object({
  id: IDSchema,
  ...islandCreateSchema.partial().shape,
})

export type IslandCreateSchemaType = z.infer<typeof islandCreateSchema>

export type IslandUpdateSchemaType = z.infer<typeof islandUpdateSchema>

