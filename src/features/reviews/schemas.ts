import z from "zod";
import { Review } from "@/features/reviews/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const ReviewCreateSchema = z.object({
  passenger_id: z.string(),
  request_id: z.string(),
  rating: z.number(),
  comment: z.string().optional(),
});

export const ReviewUpdateSchema = z.object({
  id: z.number(),
  ...ReviewCreateSchema.partial().shape,
});

export type ReviewCreateSchemaType = z.infer<typeof ReviewCreateSchema>;

export type ReviewUpdateSchemaType = z.infer<typeof ReviewUpdateSchema>;

export const ReviewSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Review>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type ReviewListSearchParams = Awaited<
  ReturnType<typeof ReviewSearchParamsCache.parse>
>;
