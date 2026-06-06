import z from "zod"

const entityNumberSchema = z.object({
  entity_name: z.string(),
  pattern: z.string(),
})

export const updateEntityNumberPatternSchema = z.array(entityNumberSchema)

export type EntityNumberPatternType = z.infer<typeof updateEntityNumberPatternSchema>


