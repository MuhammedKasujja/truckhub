import z from "zod"
import { Quotation } from "./types"
import { ENGINE_MODES } from "@/common/config"
import { IDSchema, MoneySchema } from "@/schemas"
import { ShipmentSearchParams } from "../shipments/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const QuotationSearchParams = z.object({
  sort: getSortingStateSchema<Quotation>().default([
    { id: "created_at", desc: true },
  ]),
  clientId: IDSchema.optional(),
  filters: getFiltersStateSchema<Quotation>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export const routeSchema = z.object({
  origin: z.string().min(1),
  checkpoints: z.array(z.string().min(1)),
  destination: z.string().min(1),
})

export type Route = z.infer<typeof routeSchema>

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

const createRouteSchema = z.object({
  route_id: IDSchema,
  origin: z.string(),
  destination: z.string().optional(),
})

const lineItemBase = z.object({
  tempId: z.string(),
  is_round_trip: z.boolean().nullable(),
  quantity: z.int("Required").min(1, "Minimum value is 1"),
  unit_price: MoneySchema.nullable(),
  subtotal: MoneySchema.nullable(),
  line_total: MoneySchema.nullable(),
  discount: z.string().optional().nullable(),
  engine_mode: z.enum(ENGINE_MODES),
  with_driver: z.boolean(),
  display_title: z.string().optional().nullable(),
})

export const createServiceQuotationLineItemSchema = z.object({
  source: z.literal("service"),
  route: routeSchema,
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.literal("small"),
  vehicle_year: z.string().optional().nullable(),
  service_id: IDSchema,
  vehicle_category_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  estimated_consumption_rate_km: z.number().optional(),
  ...lineItemBase.shape,
})

export const createRouteQuotationLineItemSchema = z.object({
  source: z.literal("route"),
  route: routeSchema,
  item_type: z.literal("truck"),
  with_loaders: z.boolean(),
  route_id: IDSchema,
  estimated_consumption_rate_km: z
    .number("Required")
    .min(0.5, "Minimum tonnage is 0.5"),
  tonnage: z.number("Required").min(0.1, "Required"),
  ...lineItemBase.shape,
})

export const createDistanceTonnageLineItemSchema = z.object({
  source: z.literal("distance"),
  route: routeSchema,
  item_type: z.literal("truck"),
  distance_km: z.number("Required").positive("Required").min(0.1),
  with_loaders: z.boolean(),
  estimated_consumption_rate_km: z.number().min(1, "Required"),
  tonnage: z.number("Required").min(0.1, "Required"),
  ...lineItemBase.shape,
})

const createLineItemSchema = z.discriminatedUnion("source", [
  createServiceQuotationLineItemSchema,
  createRouteQuotationLineItemSchema,
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
  minTons: z.union([z.string(), z.number()]),
  maxTons: z.union([z.string(), z.number()]),
  price: MoneySchema.optional(),
})

export const routePricingsSchema = z.object({
  tempId: IDSchema,
  routeId: IDSchema,
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.union([z.string(), z.number()]),
  pricings: z.array(tonnagePricingSchema),
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

export type ServiceLineItemRequest = z.infer<
  typeof createServiceQuotationLineItemSchema
>
export type RouteLineItemRequest = z.infer<
  typeof createRouteQuotationLineItemSchema
>

export type DistanceLineItemRequest = z.infer<
  typeof createDistanceTonnageLineItemSchema
>

export const quotationShipmentParams = z.object({
  quotation_id: IDSchema,
  ...ShipmentSearchParams.shape,
})

export type QuotationShipmentInput = z.infer<typeof quotationShipmentParams>
