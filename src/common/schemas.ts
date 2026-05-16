import { z } from "zod"

export const DefaultSearchParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().default(""),
  created_at: z.array(z.number().int()).default([]),
  joinOperator: z.enum(["and", "or"]).default("and"),
})
