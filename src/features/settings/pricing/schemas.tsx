import { IDSchema } from "@/schemas"
import z from "zod"

export const tonnageRangeSchema = z
  .object({
    min_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    max_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    price: z.number("Required").min(0, "Price is required"),
  })
  .refine((d) => d.max_tons > d.min_tons, {
    message: "Max must be greater than min",
    path: ["max_tons"],
  })

export const routePricingSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  ranges: z
    .array(tonnageRangeSchema)
    .min(1, "At least 1 tonnage range is required"),
})

export const batchPricingSchema = z.object({
  valid_from: z.date("Pricing date is required"),
  client_id: IDSchema.optional().nullable(),
  routes: z.array(routePricingSchema).min(1, "Add at least one route"),
})

export type TonnageRangeInput = z.infer<typeof tonnageRangeSchema>
export type RoutePricingInput = z.infer<typeof routePricingSchema>
export type BatchPricingInput = z.infer<typeof batchPricingSchema>

export const PriceRangeSchema = z.object({
  min_tons: z.number(),
  max_tons: z.number(),
  price: z.union([z.number(), z.string()]),
})

export type PriceRange = z.infer<typeof PriceRangeSchema>

export const RoutePayloadSchema = z.object({
  route_id: IDSchema,
  ranges: z.array(PriceRangeSchema),
})

export type RoutePayload = z.infer<typeof RoutePayloadSchema>

export const BatchPricingPayloadUpdateSchema = z.object({
  valid_from: z.string(),
  client_id: IDSchema.optional().nullable(),
  routes: z.array(RoutePayloadSchema),
})

export const BatchPricingPayloadCreateSchema = z.object({
  valid_from: z.string(),
  routes: z.array(RoutePayloadSchema),
})

export type BatchPayload = z.infer<typeof BatchPricingPayloadUpdateSchema>

export type BatchPricingPayload = z.infer<
  typeof BatchPricingPayloadUpdateSchema
>

export type BatchPricingPayloadCreate = z.infer<
  typeof BatchPricingPayloadCreateSchema
>

/** One row of the single `distance_tonnage_rates` table. */
export const DistancePricingSchema = z.object({
  distance_min_km: z.number(),
  distance_max_km: z.number().optional().nullable(),
  distance_no_upper_limit: z.boolean().default(false),
  tonnage_min: z.number(),
  tonnage_max: z.number(),
  min_price: z.number(),
  max_price: z.number(),
})

export const ListDistancePricingSchema = z.object({
  pricings: z.array(DistancePricingSchema),
})

export type ListDistancePricingRequest = z.infer<typeof ListDistancePricingSchema>

export type DistancePricingRequest = z.infer<typeof DistancePricingSchema>
