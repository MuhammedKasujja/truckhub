import z from "zod"
import { Quotation } from "./types"
import { ENGINE_MODES } from "@/common/config"
import { IDSchema, MoneySchema } from "@/schemas"
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
  rate: z.number(),
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

const createRouteSchema = z.object({
  route_id: IDSchema,
  origin: z.string(),
  destination: z.string().optional(),
})

const lineItemBase = z.object({
  tempId: z.string(),
  is_round_trip: z.boolean().nullable(),
  quantity: z.int().positive(),
  unit_price: MoneySchema.nullable(),
  subtotal: MoneySchema.nullable(),
  line_total: MoneySchema.nullable(),
  discount: z.string().optional().nullable(),
  engine_mode: z.enum(ENGINE_MODES),
  with_driver: z.boolean(),
})

export const createCarQuotationLineItemSchema = z.object({
  source: z.literal("service"),
  locations: z.array(createRouteSchema).min(1),
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.literal("small"),
  vehicle_year: z.string().optional().nullable(),
  service_id: IDSchema.optional().nullable(),
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  estimated_consumption_rate_km: z.number().optional(),
  ...lineItemBase.shape,
})

export const createTruckQuotationLineItemSchema = z.object({
  source: z.literal("route"),
  locations: z.array(createDistancePricingSchema).min(1),
  item_type: z.literal("truck"),
  with_loaders: z.boolean(),
  estimated_consumption_rate_km: z.number().min(1, "Required"),
  tonnage: z.number("Required").min(0.1, "Required"),
  ...lineItemBase.shape,
})

export const createDistanceTonnageLineItemSchema = z.object({
  source: z.literal("distance"),
  locations: z.array(createDistancePricingSchema),
  item_type: z.literal("truck"),
  distance_km: z.number(),
  with_loaders: z.boolean(),
  estimated_consumption_rate_km: z.number().min(1, "Required"),
  tonnage: z.number("Required").min(0.1, "Required"),
  ...lineItemBase.shape,
})

const createLineItemSchema = z.discriminatedUnion("source", [
  createCarQuotationLineItemSchema,
  createTruckQuotationLineItemSchema,
  createDistanceTonnageLineItemSchema,
])

export const createQuotationSchema = z.object({
  client_id: IDSchema,
  assigned_user_id: IDSchema.optional().nullable(),
  expiry_date: z.string("Date is required").optional().nullable(),
  start_date: z.string("Date is required"),
  end_date: z.string("Date is required"),
  purpose: z.string().optional(),
  discount: z.string().optional().nullable(),
  partial: MoneySchema.optional().nullable(),
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
    price: MoneySchema.optional(),
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
  price: MoneySchema.optional(),
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

export const updateQuotationSchema = z.object({
  quotationId: IDSchema,
  ...createQuotationSchema.shape,
})

export type CreateQuotationRequest = z.infer<typeof createQuotationSchema>

export type UpdateQuotationRequest = z.infer<typeof updateQuotationSchema>

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

export type DistanceLineItemRequest = z.infer<
  typeof createDistanceTonnageLineItemSchema
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
