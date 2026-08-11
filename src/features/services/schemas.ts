import z from "zod"
import { IDSchema, MoneySchema } from "@/schemas"
import { Service } from "@/features/services/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ServiceCreateSchema = z.object({
  name: z.string(),
  seats: z.number().optional(),
  base_fare: MoneySchema,
  min_fare: MoneySchema,
  price_per_min: MoneySchema,
  price_per_unit_distance: MoneySchema,
  booking_fee: MoneySchema.optional(),
  vehicle_category_id: IDSchema,
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  start_year: z.string().optional().nullable(),
  end_year: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export const ServiceUpdateSchema = z.object({
  id: IDSchema,
  ...ServiceCreateSchema.partial().shape,
})

export type ServiceCreateSchemaType = z.infer<typeof ServiceCreateSchema>

export type ServiceUpdateSchemaType = z.infer<typeof ServiceUpdateSchema>

export const ServiceSearchParamsCache = z.object({
  sort: getSortingStateSchema<Service>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Service>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type ServiceListSearchParams = z.infer<typeof ServiceSearchParamsCache>
