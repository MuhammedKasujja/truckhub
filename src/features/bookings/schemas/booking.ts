import z from "zod"
import { Booking } from "@/features/bookings/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ServiceItem = z.object({
  service_id: z.number().min(1),
  service_name: z.string().min(1),
  cost_per_item: z.string().min(1),
  total_items: z.number().min(1),
  discount: z.number().optional().nullable(),
})

export const BookingCreateSchema = z.object({
  customer_id: z.number(),
  partial: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  pickup_time: z.date(),
  return_time: z.date(),
  services: z
    .array(ServiceItem)
    .min(1, "Add at least one service")
    .max(20, "Maximum 20 items per order"),
})

export const BookingUpdateSchema = z.object({
  id: z.number(),
  ...BookingCreateSchema.partial().shape,
})

export type BookingCreateSchemaType = z.infer<typeof BookingCreateSchema>

export type BookingUpdateSchemaType = z.infer<typeof BookingUpdateSchema>

export const bookingSearchParamsSchema = z.object({
  sort: getSortingStateSchema<Booking>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Booking>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type BookingListSearchParams = z.infer<typeof bookingSearchParamsSchema>
