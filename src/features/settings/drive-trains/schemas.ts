import z from "zod";
import { DriveTrain } from "@/features/settings/drive-trains/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const DriveTrainCreateSchema = z.object({
  name: z.string(),
  tonnage_id: z.number().optional(),
  type: z.enum(["truck", "small"]).default("small").optional(),
});

export const DriveTrainUpdateSchema = z.object({
  id: z.number(),
  ...DriveTrainCreateSchema.partial().shape,
});

export type DriveTrainCreateSchemaType = z.infer<typeof DriveTrainCreateSchema>;

export type DriveTrainUpdateSchemaType = z.infer<typeof DriveTrainUpdateSchema>;

export const DriveTrainSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DriveTrain>().withDefault([
    { id: "id", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type DriveTrainListSearchParams = Awaited<
  ReturnType<typeof DriveTrainSearchParamsCache.parse>
>;
