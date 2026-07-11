import z from "zod"
import { IDSchema } from "@/schemas"
import { Review } from "@/features/reviews/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ReviewCreateSchema = z.object({
  passenger_id: IDSchema,
  request_id: IDSchema,
  rating: z.number(),
  comment: z.string().optional(),
})

export const ReviewUpdateSchema = z.object({
  id: IDSchema,
  ...ReviewCreateSchema.partial().shape,
})

export type ReviewCreateSchemaType = z.infer<typeof ReviewCreateSchema>

export type ReviewUpdateSchemaType = z.infer<typeof ReviewUpdateSchema>

export const ReviewSearchParamsCache = z.object({
  sort: getSortingStateSchema<Review>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type ReviewListSearchParams = z.infer<typeof ReviewSearchParamsCache>
