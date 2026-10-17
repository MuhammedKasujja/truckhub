import z from "zod"
import { IDSchema, ImageSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"
import { CarModel } from "@/features/settings/vehicle-config/car-model/types"

export const CarModelCreateSchema = z.object({
  name: z.string(),
  car_brand_id: IDSchema,
  vehicle_category_id: IDSchema,
  consumption_rate: z.string(),
  manufacture_year: z.string().optional().nullable(),
  image: ImageSchema.optional().nullable(),
})

export const CarModelUpdateSchema = z.object({
  id: IDSchema,
  ...CarModelCreateSchema.partial().shape,
  image_url: z.string().nullable().optional()
})

export type CarModelCreateSchemaType = z.infer<typeof CarModelCreateSchema>

export type CarModelUpdateSchemaType = z.infer<typeof CarModelUpdateSchema>

export const CarModelSearchParamsCache = z.object({
  sort: getSortingStateSchema<CarModel>().default([{ id: "id", desc: true }]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type CarModelListSearchParams = z.infer<typeof CarModelSearchParamsCache>
