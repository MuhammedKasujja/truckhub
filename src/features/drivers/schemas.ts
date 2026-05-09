import z from "zod";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";
import { Driver } from "@/features/drivers/types";

export const DriverCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  user_name: z.string().optional().nullable(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
});

export const DriverUpdateSchema = z.object({
  id: z.number(),
  ...DriverCreateSchema.partial().shape,
});

export type DriverCreateSchemaType = z.infer<typeof DriverCreateSchema>;

export type DriverUpdateSchemaType = z.infer<typeof DriverUpdateSchema>;

export const DriverSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Driver>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type DriverListSearchParams = Awaited<
  ReturnType<typeof DriverSearchParamsCache.parse>
>;
