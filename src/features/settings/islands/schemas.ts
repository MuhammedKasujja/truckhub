import z from "zod"
import { IDSchema } from "@/schemas"

export const islandCreateSchema = z.object({
  name: z.string("Required").trim().min(3, "Enter at least 3 characters"),
  locations: z
    .array(
      z.object({
        value: z.string("Required").trim().min(2, "Enter at least 2 characters"),
      })
    )
    .min(1, "Add at least one location"),
})

export const islandUpdateSchema = z.object({
  id: IDSchema,
  ...islandCreateSchema.partial().shape,
})

/** An unknown ?view= falls back to the default rather than failing the page. */
export const islandListSearchSchema = z.object({
  view: z.enum(["cards", "table"]).optional().catch(undefined),
})

export type IslandCreateSchemaType = z.infer<typeof islandCreateSchema>

export type IslandUpdateSchemaType = z.infer<typeof islandUpdateSchema>

