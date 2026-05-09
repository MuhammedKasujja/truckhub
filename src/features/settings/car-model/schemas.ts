import z from "zod";
import { CarModel } from "@/features/settings/car-model/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const CarModelCreateSchema = z.object({
  name: z.string(),
  car_brand_id: z.number(),
  vehicle_type_id: z.number(),
});

export const CarModelUpdateSchema = z.object({
  id: z.number(),
  ...CarModelCreateSchema.partial().shape,
});

export type CarModelCreateSchemaType = z.infer<typeof CarModelCreateSchema>;

export type CarModelUpdateSchemaType = z.infer<typeof CarModelUpdateSchema>;

export const CarModelSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<CarModel>().withDefault([
    { id: "id", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type CarModelListSearchParams = Awaited<
  ReturnType<typeof CarModelSearchParamsCache.parse>
>;
