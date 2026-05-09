import z from "zod";
import { Booking } from "@/features/bookings/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const ServiceItem = z.object({
  service_id: z.number().min(1),
  service_name: z.string().min(1),
  cost_per_item: z.string().min(1),
  total_items: z.number().min(1),
  discount: z.number().optional().nullable(),
});

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
});

export const BookingUpdateSchema = z.object({
  id: z.number(),
  ...BookingCreateSchema.partial().shape,
});

export type BookingCreateSchemaType = z.infer<typeof BookingCreateSchema>;

export type BookingUpdateSchemaType = z.infer<typeof BookingUpdateSchema>;

export const BookingSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Booking>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type BookingListSearchParams = Awaited<
  ReturnType<typeof BookingSearchParamsCache.parse>
>;
