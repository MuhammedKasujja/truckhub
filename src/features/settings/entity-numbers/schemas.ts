import z from "zod"
import { NUMBERING_ENTITIES } from "@/common/constants"

const entityNumberSchema = z.object({
  pattern: z.string().min(3, "Required"),
  counter_padding: z.string(),
  last_number: z.int().optional(),
})

export const NumberingPatternSchema = z.object({
  entities: z.record(z.enum(NUMBERING_ENTITIES), entityNumberSchema),
})

export type NumberingPatternType = z.infer<typeof NumberingPatternSchema>

export type NumberingPattern = z.infer<typeof NumberingPatternSchema>

export type NumberingEntityKey = keyof NumberingPatternType["entities"]
