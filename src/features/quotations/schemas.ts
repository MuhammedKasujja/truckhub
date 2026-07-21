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

const createQuotationLineItemSchema = z.object({
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  line_total: z.number().positive(),
  services: z.array(createServiceRouteSchema),
  vehicle_addons: z.array(createVehicleAddonSchema),
  item_type: z.enum(LINE_ITEM_TYPES),
  quantity: z.number().positive(),
  discount: z.number().positive(),
  vehicle_year: z.string().optional(),
  car_brand_id: IDSchema,
  car_model_id: IDSchema,
  with_loaders: z.boolean().default(false),
  with_driver: z.boolean(),
  estimated_consumption_rate_km: z.number().positive(),
  engine_mode: z.enum(ENGINE_MODES).default("wet"),
  tonnage: z.number().positive(),
})

export const createQuotationSchema = z.object({
  client_id: IDSchema,
  expiry_date: z.date(),
  purpose: z.string().optional(),
  discount: z.number().positive(),
  tax_rates: z.array(createTaxRateSchema).default([]),
  line_items: z.array(createQuotationLineItemSchema),
})

export type CreateQuotationRequest = z.infer<typeof createQuotationSchema>
