import z from "zod"
import { PricingSearchParamsCache } from "../settings/pricing/schemas"
import { ServiceCreateSchema, ServiceUpdateSchema } from "../services/schemas"
import { CLIENT_PRICING_TYPES } from "./enums"
import type { Client } from "@/features/clients/types"
import { IDSchema } from "@/schemas"
import { ClientTypeList } from "@/config/constants"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { LIST_VIEWS } from "@/components/view-toggle"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ClientContactSchema = z.object({
  id: IDSchema.optional(),
  name: z.string().trim().min(1, "Required"),
  phone: z.string().trim().min(3, "Required"),
  // A blank input submits "" and the API can return null
  email: z
    .union([z.email(), z.literal("")])
    .optional()
    .nullable(),
  is_primary: z.boolean(),
})

export type ClientContactInput = z.infer<typeof ClientContactSchema>

export const ClientContactsSchema = z
  .array(ClientContactSchema)
  .min(1, "Add at least one contact")
  .refine(
    (contacts) => contacts.filter((c) => c.is_primary).length === 1,
    "Choose exactly one primary contact"
  )

export const ClientCreateSchema = z.object({
  name: z.string().trim().min(3, "Required"),
  short_name: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  // state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().trim().min(3, "Required"),
  email: z.email().trim().min(3, "Required"),
  tin_number: z.string().trim().min(3, "Required"),
  asssigned_user_id: IDSchema.optional().nullable(),
  contacts: ClientContactsSchema,
})

export const ClientUpdateSchema = z.object({
  id: IDSchema,
  ...ClientCreateSchema.partial().shape,
  contacts: ClientContactsSchema,
})

export type ClientCreateInput = z.infer<typeof ClientCreateSchema>

export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>

export const ClientSearchParamsCache = z.object({
  sort: getSortingStateSchema<Client>().default([
    { id: "created_at", desc: true },
  ]),
  client_type: z.enum(ClientTypeList).optional(),
  // advanced filter
  filters: getFiltersStateSchema<Client>().optional(),
  /** List layout; UI only, never sent to the API. Cards when absent. */
  view: z.enum(LIST_VIEWS).optional(),
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

export const ClientServiceCreateSchema = z.object({
  clientId: IDSchema,
  ...ServiceCreateSchema.shape,
})

export type ClientServiceCreateInput = z.infer<typeof ClientServiceCreateSchema>

export const clientPricingSearchParams = z.object({
  ...PricingSearchParamsCache.partial().shape,
  clientId: IDSchema,
})

export type ClientPricingSearchParam = z.infer<typeof clientPricingSearchParams>

export const ActivateClientPricingSchema = z.object({
  effectiveDate: z.string(),
  source: z.enum(CLIENT_PRICING_TYPES),
  clientId: IDSchema,
})

export type ActivateClientPricing = z.infer<typeof ActivateClientPricingSchema>
