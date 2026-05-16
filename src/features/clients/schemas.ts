import z from "zod"
import { Customer } from "@/features/clients/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const CustomerCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  user_name: z.string().optional().nullable(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
  tin_number: z.string(),
  asssigned_user_id: z.number().optional().nullable(),
})

export const CustomerUpdateSchema = z.object({
  id: z.number(),
  ...CustomerCreateSchema.partial().shape,
})

export type CustomerCreateSchemaType = z.infer<typeof CustomerCreateSchema>

export type CustomerUpdateSchemaType = z.infer<typeof CustomerUpdateSchema>

export const CustomerSearchParamsCache = z.object({
  sort: getSortingStateSchema<Customer>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Customer>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type CustomerListSearchParams = z.infer<typeof CustomerSearchParamsCache>

export const TonnagePricingSchema = z.object({
  tonnage_min: z.number(),
  tonnage_max: z.number(),
  price: z.number(),
})

export const DistanceTonnagePricingSchema = z.object({
  route: z.string().min(1, "Route is required"),
  distance_km: z.number().positive("Distance is required"),
  delivery_min_hrs: z.number(),
  delivery_max_hrs: z.number(),
  tonnages: z
    .array(TonnagePricingSchema)
    .min(1, "At least one tonnage pricing is required"),
})

export const RoutePricingSchema = z.object({
  effective_date: z.date(),
  routes_pricings: z.array(DistanceTonnagePricingSchema),
})

export type RoutePricingType = z.infer<typeof RoutePricingSchema>
