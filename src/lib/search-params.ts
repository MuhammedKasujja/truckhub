import qs from "qs";
import type { ParserMap } from "nuqs/server";
import { getValidFilters } from "@/lib/data-table";
import { createSearchParamsCache } from "nuqs/server";

/**
 * Generic helper to:
 * 1. Parse search params using any nuqs cache/schema
 * 2. Apply your custom filters logic
 * 3. Return strongly-typed result + augmented filters
 * */

export async function generatePageSearchParams<Parsers extends ParserMap>(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
  cache: ReturnType<typeof createSearchParamsCache<Parsers>>, // ← infer from the factory
) {
  const raw = await searchParamsPromise;
  const parsed = cache.parse(raw);

  // If your parsers object always includes 'filters' (or make it conditional)
  const rawFilters = "filters" in parsed ? parsed.filters : undefined;
  const filters = getValidFilters(rawFilters);

  return {
    ...parsed,
    filters,
  };
}

export const generateApiSearchParams = (input: Record<string, unknown>) => {
  const { sort, ...rest } = input;
  let normalized = { ...rest };

  if (sort && sort instanceof Array) {
    normalized = {
      ...normalized,
      // make sort of structure sortBy=-created_at&sortBy=name where - means desc
      sortBy: generateParams(sort),
    };
  }

  return qs.stringify(normalized, {
    arrayFormat: "repeat",
    skipNulls: true,
    encode: true,
    allowDots: false, // API prefers dots
  });
};

const generateParams = (sortArray: Array<{ id: string; desc: boolean }>) => {
  if (sortArray.length > 0) {
    return sortArray.map((s) => (s.desc ? `-${s.id}` : s.id));
  }
  return undefined;
};
