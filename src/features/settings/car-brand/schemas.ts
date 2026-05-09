import z from "zod";
import { CarBrand } from "@/features/settings/car-brand/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const CarBrandCreateSchema = z.object({
  name: z.string(),
});

export const CarBrandUpdateSchema = z.object({
  id: z.number(),
  ...CarBrandCreateSchema.partial().shape,
});

export type CarBrandCreateSchemaType = z.infer<typeof CarBrandCreateSchema>;

export type CarBrandUpdateSchemaType = z.infer<typeof CarBrandUpdateSchema>;

export const CarBrandSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<CarBrand>().withDefault([
    { id: "id", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type CarBrandListSearchParams = Awaited<
  ReturnType<typeof CarBrandSearchParamsCache.parse>
>;
