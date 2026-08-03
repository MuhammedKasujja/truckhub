import z from "zod"
import { Quotation } from "./types"
import { IDSchema } from "@/schemas"
import { ENGINE_MODES } from "@/common/config"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const QuotationSearchParams = z.object({
  sort: getSortingStateSchema<Quotation>().default([
    { id: "created_at", desc: true },
  ]),
  filters: getFiltersStateSchema<Quotation>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type QuotationListSearchParams = z.infer<typeof QuotationSearchParams>

const createTaxRateSchema = z.object({
  id: IDSchema,
  tax_name: z.string(),
  rate: z.number().positive(),
})

const createVehicleAddonSchema = z.object({
  id: IDSchema,
  name: z.string(),
})

const createDistancePricingSchema = z.object({
  route_id: IDSchema,
  pricing_id: IDSchema,
  origin: z.string(),
  destination: z.string().optional(),
  price: z.number().positive(),
  min_tons: z.number().positive(),
  max_tons: z.number().positive(),
})
const createRoutePricingSchema = z.object({
  route_id: IDSchema,
  origin: z.string(),
  destination: z.string().optional(),
  price: z.number().positive(),
})
const createRouteSchema = z.object({
  route_id: IDSchema,
  origin: z.string(),
  destination: z.string().optional(),
})
// TODO: make a discriminated union for array of inputs/ services

export const createCarQuotationLineItemSchema = z.object({
  tempId: z.string(),
  is_round_trip: z.boolean().nullable(),
  unit_price: z.number().positive().nullable(),
  subtotal: z.number().positive().nullable(),
  line_total: z.number().positive().nullable(),
  services: z.array(createRouteSchema).min(1),
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.literal("small"),
  quantity: z.int().positive(),
  discount: z.number().optional().nullable(),
  vehicle_year: z.string().optional().nullable(),
  service_id: IDSchema.optional().nullable(),
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().optional(),
  engine_mode: z.enum(ENGINE_MODES),
})

export const createTruckQuotationLineItemSchema = z.object({
  tempId: z.string(),
  is_round_trip: z.boolean().nullable(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  line_total: z.number().positive(),
  services: z.array(createDistancePricingSchema).min(1),
  item_type: z.literal("truck"),
  quantity: z.int().positive(),
  discount: z.number().optional(),
  with_loaders: z.boolean(),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().min(1, "Required"),
  engine_mode: z.enum(ENGINE_MODES),
  tonnage: z.number("Required").min(0.1, "Required"),
})

const createLineItemSchema = z.discriminatedUnion("item_type", [
  createCarQuotationLineItemSchema,
  createTruckQuotationLineItemSchema,
])

export const createQuotationSchema = z.object({
  client_id: IDSchema,
  assigned_user_id: IDSchema.optional().nullable(),
  expiry_date: z.string("Date is required").optional().nullable(),
  start_date: z.string("Date is required"),
  end_date: z.string("Date is required"),
  purpose: z.string().optional(),
  discount: z.number().positive().optional(),
  partial: z.number().positive().optional(),
  number: z.string().optional(),
  tax_rates: z.array(createTaxRateSchema),
  line_items: z.array(createLineItemSchema).min(1),
})

export const tonnagePricingRangeSchema = z
  .object({
    id: IDSchema,
    min_tons: z.union([z.string(), z.number()]),
    max_tons: z.union([z.string(), z.number()]),
    tons: z.string().min(1, "Required"),
    price: z.union([z.string(), z.number()]).optional(),
    default_price: z.union([z.string(), z.number()]),
  })
  .superRefine(({ tons, min_tons, max_tons }, ctx) => {
    if (tons < min_tons || tons > max_tons) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tons"],
        message: `Tons must be between ${min_tons} and ${max_tons}`,
      })
    }
  })

export const tonnagePricingSchema = z.object({
  id: IDSchema,
  min_tons: z.union([z.string(), z.number()]),
  max_tons: z.union([z.string(), z.number()]),
  price: z.union([z.string(), z.number()]).optional(),
})

export const routePricingsSchema = z.object({
  tempId: IDSchema,
  route_id: IDSchema,
  origin: z.string(),
  destination: z.string(),
  distance_km: z.union([z.string(), z.number()]),
  min_hrs: z.union([z.string(), z.number()]),
  max_hrs: z.union([z.string(), z.number()]),
  pricing: tonnagePricingSchema,
})

const bookingRoutesSchema = z.object({
  tempId: IDSchema,
  is_round_trip: z.boolean().default(false).optional(),
  routes: z
    .array(routePricingsSchema)
    .min(1, "Add at least one destination")
    .max(20, "Maximum 20 items per order"),
})

export type CreateQuotationRequest = z.infer<typeof createQuotationSchema>

export type RoutePricingStruct = z.infer<typeof routePricingsSchema>

export type RouteServiceInput = z.infer<typeof createRouteSchema>

export type LineItemRequest = z.infer<typeof createLineItemSchema>
export type LineItemResponse = LineItemRequest

export type SmallLineItemRequest = z.infer<
  typeof createCarQuotationLineItemSchema
>
export type TruckLineItemRequest = z.infer<
  typeof createTruckQuotationLineItemSchema
>

const loactionBasedSchema = z.object({
  // source: z.literal("location"),
  source: z.literal("small"),
  ...createRouteSchema.shape,
})

const routePricingBasedSchema = z.object({
  source: z.literal("route"),
  ...createRouteSchema.shape,
})

const distancePricingBasedSchema = z.object({
  source: z.literal("distance"),
  ...createRouteSchema.shape,
})

export type LocationServiceResponse = z.infer<typeof loactionBasedSchema>

export type PricingRouteServiceResponse = z.infer<
  typeof routePricingBasedSchema
>

export type DistanceRouteServiceResponse = z.infer<
  typeof distancePricingBasedSchema
>

const locationServiceSchema = z.discriminatedUnion("source", [
  loactionBasedSchema,
  routePricingBasedSchema,
  distancePricingBasedSchema,
])

const locationSourceSchema = z.array(locationServiceSchema)

export type LocationSourceResponse = z.infer<typeof locationSourceSchema>
