import z from "zod";
import { RideRequest } from "@/features/ride-requests/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string(),
});

export const CheckpointSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  distance: z.number(),
  time: z.number(),
  estimated_fare: z.number(),
  position: z.number()
});

export const RideRequestCreateSchema = z.object({
  service_id: z.number(),
  customer_id: z.number(),
  driver_id: z.string().optional(),
  pickup_location: LocationSchema,
  destination_location: LocationSchema,
  requires_fuel: z.boolean().default(false).optional(),
  requires_loaders: z.boolean().default(false).optional(),
  is_scheduled: z.boolean().default(false).optional(),
  estimated_time: z.number().optional(),
  estimated_distance: z.number().optional(),
  request_start_time: z.date(),
  polyline_route: z.string().optional(),
  partial: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  checkpoints: z.array(CheckpointSchema).optional().nullable(),
});

export const RideRequestUpdateSchema = z.object({
  id: z.number(),
  ...RideRequestCreateSchema.partial().shape,
});

export type RideRequestCreateSchemaType = z.infer<
  typeof RideRequestCreateSchema
>;

export type RideRequestUpdateSchemaType = z.infer<
  typeof RideRequestUpdateSchema
>;

export const RideRequestSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RideRequest>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type RideRequestListSearchParams = Awaited<
  ReturnType<typeof RideRequestSearchParamsCache.parse>
>;
