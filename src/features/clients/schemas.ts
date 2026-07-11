import z from "zod"
import { IDSchema } from "@/schemas"
import { Client } from "@/features/clients/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const CustomerCreateSchema = z.object({
  name: z.string().trim().min(3, "Required"),
  short_name: z.string().optional().nullable(),
  phone: z.string().trim().min(3, "Required"),
  email: z.email().trim().min(3, "Required"),
  password: z.string(),
  tin_number: z.string().trim().min(3, "Required"),
  asssigned_user_id: IDSchema.optional().nullable(),
})

export const CustomerUpdateSchema = z.object({
  id: IDSchema,
  ...CustomerCreateSchema.partial().shape,
})

export type CustomerCreateSchemaType = z.infer<typeof CustomerCreateSchema>

export type CustomerUpdateSchemaType = z.infer<typeof CustomerUpdateSchema>

export const ClientSearchParamsCache = z.object({
  sort: getSortingStateSchema<Client>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Client>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type ClientListSearchParams = z.infer<typeof ClientSearchParamsCache>

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
