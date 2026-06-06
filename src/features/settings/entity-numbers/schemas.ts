import z from "zod"
import { ENTITY_NUMBER_PATTERNS } from "@/common/constants"

const entityNumberSchema = z.object({
  pattern: z.string(),
  counter_padding: z.int().positive(),
  last_number: z.int().positive(),
})

export const NumberingPatternSchema = z.object({
  entities: z.record(z.enum(ENTITY_NUMBER_PATTERNS), entityNumberSchema),
})

export type NumberingPatternType = z.infer<typeof NumberingPatternSchema>

export type NumberingEntityKey = keyof NumberingPatternType["entities"];
