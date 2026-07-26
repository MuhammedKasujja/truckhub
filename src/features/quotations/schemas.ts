import z from "zod"
import { Quotation } from "./types"
import { IDSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { ENGINE_MODES, LINE_ITEM_TYPES } from "@/common/config"
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

const createServiceRouteSchema = z.object({
  route_id: IDSchema,
  origin: z.date(),
  destination: z.string().optional(),
  price: z.number().positive(),
  min_tons: z.number().positive(),
  max_tons: z.number().positive(),
})

export const createCarQuotationLineItemSchema = z.object({
  tempId: z.string(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  line_total: z.number().positive(),
  services: z.array(createServiceRouteSchema),
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.enum(LINE_ITEM_TYPES),
  quantity: z.number().positive(),
  discount: z.number().optional(),
  vehicle_year: z.string().optional(),
  service_id: IDSchema.optional().nullable(),
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().optional(),
  engine_mode: z.enum(ENGINE_MODES),
})

export const createTruckQuotationLineItemSchema = z.object({
  tempId: z.string(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  line_total: z.number().positive(),
  services: z.array(createServiceRouteSchema),
  item_type: z.enum(LINE_ITEM_TYPES),
  quantity: z.number().positive(),
  discount: z.number().optional(),
  with_loaders: z.boolean(),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().optional(),
  engine_mode: z.enum(ENGINE_MODES),
  tonnage: z.number().optional(),
})

export const createQuotationLineItemSchema = z.object({
  tempId: z.string(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  line_total: z.number().positive(),
  services: z.array(createServiceRouteSchema),
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.enum(LINE_ITEM_TYPES),
  quantity: z.number().positive(),
  discount: z.number().optional(),
  vehicle_year: z.string().optional(),
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  with_loaders: z.boolean(),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().optional(),
  engine_mode: z.enum(ENGINE_MODES),
  tonnage: z.number().optional(),
})

export const createQuotationSchema = z.object({
  client_id: IDSchema,
  assigned_user_id: IDSchema.optional().nullable(),
  expiry_date: z.string(),
  purpose: z.string().optional(),
  discount: z.number().positive().optional(),
  partial: z.number().positive().optional(),
  number: z.string().optional(),
  tax_rates: z.array(createTaxRateSchema).default([]),
  line_items: z.array(createQuotationLineItemSchema),
})

export const tonnagePricingSchema = z
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

export type LineItemRequest = z.infer<typeof createQuotationLineItemSchema>
