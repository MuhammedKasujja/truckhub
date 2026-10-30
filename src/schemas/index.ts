import z from "zod"
import {
  SUPPORTED_DOC_EXTENSIONS,
  SUPPORTED_IMAGE_EXTENSIONS,
} from "@/config/constants"

export const IDSchema = z.string("Required").min(2, "Required")

export const ImageSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5MB")
  .refine(
    (f) => SUPPORTED_IMAGE_EXTENSIONS.includes(f.type),
    "File not supported"
  )

export const DocumentFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5MB")
  .refine(
    (f) => SUPPORTED_DOC_EXTENSIONS.includes(f.type),
    "File not supported"
  )

export const MoneySchema = z
  .string("Required")
  .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")

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
