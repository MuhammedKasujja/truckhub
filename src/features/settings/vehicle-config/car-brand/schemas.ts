import z from "zod"
import { CarBrand } from "./types"
import { IDSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const CarBrandCreateSchema = z.object({
  name: z.string(),
})

export const CarBrandUpdateSchema = z.object({
  id: IDSchema,
  ...CarBrandCreateSchema.partial().shape,
})

export type CarBrandCreateSchemaType = z.infer<typeof CarBrandCreateSchema>

export type CarBrandUpdateSchemaType = z.infer<typeof CarBrandUpdateSchema>

export const CarBrandSearchParamsCache = z.object({
  sort: getSortingStateSchema<CarBrand>().default([{ id: "id", desc: true }]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type CarBrandListSearchParams = z.infer<typeof CarBrandSearchParamsCache>
