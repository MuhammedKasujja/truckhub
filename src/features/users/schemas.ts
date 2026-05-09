import z from "zod";
import { SystemUser } from "@/features/users/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const UserCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
});

export const UserUpdateSchema = z.object({
  id: z.number(),
  ...UserCreateSchema.partial().shape,
});

export type UserCreateSchemaType = z.infer<typeof UserCreateSchema>;

export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;

export const UserSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<SystemUser>().withDefault([
    { id: "created_at", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  created_at: parseAsArrayOf(parseAsInteger).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type UserListSearchParams = Awaited<
  ReturnType<typeof UserSearchParamsCache.parse>
>;
