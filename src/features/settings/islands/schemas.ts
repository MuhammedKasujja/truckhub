import z from "zod"
import { IDSchema } from "@/schemas"

export const islandCreateSchema = z.object({
  name: z.string(),
  locations: z
      .array(z.object({ value: z.string('Required').trim().min(2, "Too Short") }))
      .min(1, "Locations cannot be empty"),
})

export const islandUpdateSchema = z.object({
  id: IDSchema,
  ...islandCreateSchema.partial().shape,
})

export type IslandCreateSchemaType = z.infer<typeof islandCreateSchema>

export type IslandUpdateSchemaType = z.infer<typeof islandUpdateSchema>

