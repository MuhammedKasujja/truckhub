import z from "zod"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { VehicleType } from "@/features/settings/vehicle-types/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const VehicleTypeCreateSchema = z.object({
  name: z.string(),
  is_truck: z.boolean().default(false).optional(),
})

export const VehicleTypeUpdateSchema = z.object({
  id: z.number(),
  ...VehicleTypeCreateSchema.partial().shape,
})

export type VehicleTypeCreateSchemaType = z.infer<
  typeof VehicleTypeCreateSchema
>

export type VehicleTypeUpdateSchemaType = z.infer<
  typeof VehicleTypeUpdateSchema
>

export const VehicleTypeSearchParamsCache = z.object({
  sort: getSortingStateSchema<VehicleType>().default([
    { id: "id", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type VehicleTypeListSearchParams = z.infer<
  typeof VehicleTypeSearchParamsCache
>
