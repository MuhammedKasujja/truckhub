import z from "zod"
import { vehicleTypesList } from "./enums"
import { IDSchema, ImageSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"
import { VehicleCategory } from "@/features/settings/vehicle-config/vehicle-categories/types"

export const VehicleCategoryCreateSchema = z.object({
  name: z.string(),
  type: z.enum(vehicleTypesList),
  parent_category_id: IDSchema.optional().nullable(),
  image: ImageSchema.optional().nullable(),
})

export const VehicleCategoryUpdateSchema = z.object({
  id: IDSchema,
  ...VehicleCategoryCreateSchema.partial().shape,
})

export type VehicleCategoryCreateSchemaType = z.infer<
  typeof VehicleCategoryCreateSchema
>

export type VehicleCategoryUpdateSchemaType = z.infer<
  typeof VehicleCategoryUpdateSchema
>

export const VehicleCategorySearchParamsCache = z.object({
  sort: getSortingStateSchema<VehicleCategory>().default([
    { id: "id", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type VehicleCategoryListSearchParams = z.infer<
  typeof VehicleCategorySearchParamsCache
>
