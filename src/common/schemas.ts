import { z } from "zod"

export const DefaultSearchParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  created_at: z.array(z.number().int()).optional(),
  joinOperator: z.enum(["and", "or"]).optional(),
})

export const EntityPickerSearchParams = z.object({
  prefill: z.string().optional(),
  returnTo: z.string().optional(),
  field: z.string().optional(),
})

export type EntityPickerSearchParamsInput = z.infer<
  typeof EntityPickerSearchParams
>
