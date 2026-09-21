import z from "zod"

export const IDSchema = z.string("Required").min(2, "Required")

export const MoneySchema = z.string("Required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")

export type EntityId = z.infer<typeof IDSchema>

export const EntityIdSchema = z.object({
  id: IDSchema,
})

export const SearchQuerySchema = z.object({
  page: z.number().optional().nullable(),
  search: z.string().optional().nullable(),
  perPage: z.number().optional().nullable(),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>
export type DefaultSearchQuery = SearchQuery
