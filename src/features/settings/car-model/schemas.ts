import z from "zod"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { CarModel } from "@/features/settings/car-model/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const CarModelCreateSchema = z.object({
  name: z.string(),
  car_brand_id: z.number(),
  vehicle_type_id: z.number(),
})

export const CarModelUpdateSchema = z.object({
  id: z.number(),
  ...CarModelCreateSchema.partial().shape,
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
