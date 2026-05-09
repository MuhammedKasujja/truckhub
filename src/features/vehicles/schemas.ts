import z from "zod";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";
import { EngineTypes, Gearboxes, Vehicle } from "@/features/vehicles/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const VehicleCreateSchema = z.object({
  plate_number: z.string(),
  color: z.string(),
  interior_color: z.string().optional().nullable(),
  cylinders: z.string(),
  tank_capacity: z.number(),
  consumption_rate: z.number(),
  engine_type: z.enum(EngineTypes),
  gearbox: z.enum(Gearboxes),
  // year: z.number().min(2010).max((new Date()).getFullYear()),
  year: z.string(),
  seats: z.number().optional().nullable(),
  vehicle_type_id: z.number(),
  car_brand_id: z.number(),
  car_model_id: z.number(),
  drive_train_id: z.number(),
  tonnage_id: z.number().optional().nullable(),
});

export const VehicleUpdateSchema = z.object({
  id: z.number(),
  ...VehicleCreateSchema.partial().shape,
});

export type VehicleCreateSchemaType = z.infer<typeof VehicleCreateSchema>;

export type VehicleUpdateSchemaType = z.infer<typeof VehicleUpdateSchema>;

export const VehicleSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Vehicle>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type VehicleListSearchParams = Awaited<
  ReturnType<typeof VehicleSearchParamsCache.parse>
>;
