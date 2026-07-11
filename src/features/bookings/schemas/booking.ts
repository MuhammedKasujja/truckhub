import z from "zod"
import { IDSchema } from "@/schemas"
import { Booking } from "@/features/bookings/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ServiceItem = z.object({
  service_id: IDSchema,
  service_name: z.string().min(1),
  cost_per_item: z.string().min(1),
  total_items: z.number().min(1),
  discount: z.number().optional().nullable(),
})

export const BookingCreateSchema = z.object({
  client_id: IDSchema,
  partial: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  pickup_time: z.date(),
  return_time: z.date(),
  contacts: z.array(IDSchema).optional().nullable(),
  services: z
    .array(ServiceItem)
    .min(1, "Add at least one service")
    .max(20, "Maximum 20 items per order"),
})

export const BookingUpdateSchema = z.object({
  id: IDSchema,
  ...BookingCreateSchema.partial().shape,
})

export type BookingCreateSchemaType = z.infer<typeof BookingCreateSchema>

export type BookingUpdateSchemaType = z.infer<typeof BookingUpdateSchema>

export const BookingSearchParamsSchema = z.object({
  sort: getSortingStateSchema<Booking>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Booking>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type BookingListSearchParams = z.infer<typeof BookingSearchParamsSchema>

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
  pricing: tonnagePricingSchema
})

export const bookingRoutesSchema = z.object({
  tempId: IDSchema,
  is_round_trip: z.boolean().default(false).optional(),
  routes: z
    .array(routePricingsSchema)
    .min(1, "Add at least one destination")
    .max(20, "Maximum 20 items per order"),
})

export const TruckBookingSchema = z.object({
  client_id: IDSchema,
  partial: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  pickup_time: z.date("Required"),
  return_time: z.date("Required"),
  contacts: z.array(IDSchema).optional().nullable(),
  services: z
    .array(bookingRoutesSchema)
    .min(1, "Add at least one service")
    .max(20, "Maximum 20 items per order"),
})

export type RoutePricingStruct = z.infer<typeof routePricingsSchema>

export type TruckBookingRequest = z.infer<typeof TruckBookingSchema>

export type TonnagePricingRequest = z.infer<typeof tonnagePricingSchema>

export type BookingRouteRequest = z.infer<typeof bookingRoutesSchema>
