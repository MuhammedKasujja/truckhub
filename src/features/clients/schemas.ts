import z from "zod";
import { Customer } from "@/features/clients/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const CustomerCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  user_name: z.string().optional().nullable(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
  tin_number: z.string(),
});

export const CustomerUpdateSchema = z.object({
  id: z.number(),
  ...CustomerCreateSchema.partial().shape,
});

export type CustomerCreateSchemaType = z.infer<typeof CustomerCreateSchema>;

export type CustomerUpdateSchemaType = z.infer<typeof CustomerUpdateSchema>;

export const CustomerSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Customer>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type CustomerListSearchParams = Awaited<
  ReturnType<typeof CustomerSearchParamsCache.parse>
>;
