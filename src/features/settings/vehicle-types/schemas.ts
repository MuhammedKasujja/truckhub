import z from "zod";
import { VehicleType } from "@/features/settings/vehicle-types/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const VehicleTypeCreateSchema = z.object({
  name: z.string(),
  is_truck: z.boolean().default(false).optional(),
});

export const VehicleTypeUpdateSchema = z.object({
  id: z.number(),
  ...VehicleTypeCreateSchema.partial().shape,
});

export type VehicleTypeCreateSchemaType = z.infer<
  typeof VehicleTypeCreateSchema
>;

export type VehicleTypeUpdateSchemaType = z.infer<
  typeof VehicleTypeUpdateSchema
>;

export const VehicleTypeSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<VehicleType>().withDefault([
    { id: "id", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type VehicleTypeListSearchParams = Awaited<
  ReturnType<typeof VehicleTypeSearchParamsCache.parse>
>;
