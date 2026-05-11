import z from "zod"

export const IDSchema = z.union([z.string(), z.number()])

export type EntityId = z.infer<typeof IDSchema>

export const EntityIdSchema = z.object({
  id: IDSchema,
})

export const SearchQuerySchema = z.object({
  search: z.string().optional().nullable(),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

export const DeleteServiceSchema = z.object({
  id: z.uuidv7("Invalid service ID"),
})

export type DeleteServiceInput = z.infer<typeof DeleteServiceSchema>
