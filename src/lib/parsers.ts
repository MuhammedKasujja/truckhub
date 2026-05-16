import { z } from "zod"
import { createParser } from "nuqs/server"

import { dataTableConfig } from "@/config/data-table"

import type {
  ExtendedColumnSort,
  ExtendedColumnFilter,
} from "@/types/data-table"

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

export const getSortingStateParser = <TData>(
  columnIds?: string[] | Set<string>
) => {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(sortingItemSchema).safeParse(parsed)

        if (!result.success) return null

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnSort<TData>[]
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc
      ),
  })
}

export function getSortingStateSchema<TData>(
  columnIds?: string[] | Set<string>
) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return z
    .array(z.object({ id: z.string(), desc: z.boolean() }))
    .default([{ id: "created_at", desc: true }])
    .transform((sorts) =>
      validKeys ? sorts.filter((s) => validKeys.has(s.id)) : sorts
    )
    .transform((sorts) => sorts as ExtendedColumnSort<TData>[])
}

export function getFiltersStateSchema<TData>(
  columnIds?: string[] | Set<string>
) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  // Validate the array structurally, then cast to the generic type.
  // No string transform needed — the router owns JSON serialization.
  const baseSchema = z.array(filterItemSchema).default([])

  if (!validKeys) {
    return baseSchema.transform(
      (filters) => filters as ExtendedColumnFilter<TData>[]
    )
  }

  return baseSchema
    .transform((filters) => filters.filter((item) => validKeys.has(item.id)))
    .transform((filters) => filters as ExtendedColumnFilter<TData>[])
}

const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
})

export type FilterItemSchema = z.infer<typeof filterItemSchema>

export const getFiltersStateParser = <TData>(
  columnIds?: string[] | Set<string>
) => {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(filterItemSchema).safeParse(parsed)

        if (!result.success) return null

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnFilter<TData>[]
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.variant === b[index]?.variant &&
          filter.operator === b[index]?.operator
      ),
  })
}
