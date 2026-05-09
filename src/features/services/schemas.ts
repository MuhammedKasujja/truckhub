import z from "zod";
import { Service } from "@/features/services/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const ServiceCreateSchema = z.object({
  name: z.string(),
  seats: z.number().optional(),
  base_fare: z.number(),
  min_fare: z.number(),
  price_per_min: z.number(),
  price_per_unit_distance: z.number(),
  booking_fee: z.number().optional(),
  tax_fee: z.number().optional(),
  vehicle_type_id: z.number(),
  minimum_hire_fee: z.number(),
  start_year: z.string().optional(),
  end_year: z.string().optional(),
  description: z.string().optional().nullable(),
});

export const ServiceUpdateSchema = z.object({
  id: z.number(),
  ...ServiceCreateSchema.partial().shape,
});

export type ServiceCreateSchemaType = z.infer<typeof ServiceCreateSchema>;

export type ServiceUpdateSchemaType = z.infer<typeof ServiceUpdateSchema>;

export const ServiceSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Service>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type ServiceListSearchParams = Awaited<
  ReturnType<typeof ServiceSearchParamsCache.parse>
>;
