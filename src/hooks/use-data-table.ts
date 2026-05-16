import {
  type Updater,
  useReactTable,
  getCoreRowModel,
  type TableState,
  getSortedRowModel,
  type SortingState,
  type TableOptions,
  getFacetedRowModel,
  getFilteredRowModel,
  type PaginationState,
  type VisibilityState,
  getPaginationRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  type RowSelectionState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import * as React from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import type { ExtendedColumnSort, QueryKeys } from "@/types/data-table"

const PAGE_KEY = "page"
const PER_PAGE_KEY = "perPage"
const SORT_KEY = "sort"
const FILTERS_KEY = "filters"
const SEARCH_KEY = "search"
const JOIN_OPERATOR_KEY = "joinOperator"
const ARRAY_SEPARATOR = ","
const DEBOUNCE_MS = 300
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
  extends
    Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  queryKeys?: Partial<QueryKeys>
  /**
   * "replace" skips adding a history entry (nuqs shallow:true equivalent).
   * "push" adds a history entry (nuqs shallow:false equivalent).
   */
  history?: "push" | "replace"
  debounceMs?: number
  throttleMs?: number
  /**
   * When true, omit the key from the URL when value equals its default.
   * Mirrors nuqs clearOnDefault.
   */
  clearOnDefault?: boolean
  enableAdvancedFilter?: boolean
  scroll?: boolean
  shallow?: boolean
  startTransition?: React.TransitionStartFunction
}

/** Returns undefined instead of the value when clearOnDefault is active. */
function clearable<T>(
  value: T,
  defaultValue: T,
  clear: boolean
): T | undefined {
  if (!clear) return value
  return JSON.stringify(value) === JSON.stringify(defaultValue)
    ? undefined
    : value
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    queryKeys,
    history = "replace",
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props
  const pageKey = queryKeys?.page ?? PAGE_KEY
  const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY
  const sortKey = queryKeys?.sort ?? SORT_KEY
  const searchKey = queryKeys?.search ?? SEARCH_KEY
  const filtersKey = queryKeys?.filters ?? FILTERS_KEY
  const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY

  // strict:false lets this hook work in any component tree without knowing
  // the exact route. Types come back as Partial<FullSearchSchema>.
  // If your table always lives on one known route, prefer Route.useSearch().
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  /**
   * Core navigate helper.
   *
   * Mirrors nuqs queryStateOptions:
   *   shallow  → replace: true  (no new history entry)
   *   history  → replace / push
   *   scroll   → passed through
   *   startTransition → wraps the navigate call
   *
   * throttleMs is intentionally omitted — TanStack Router batches same-tick
   * updates automatically; debounce at the call site handles rate-limiting.
   */
  const updateSearch = React.useCallback(
    (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      const doNavigate = () => {
        navigate({
          search: updater,
          replace: history === "replace" || shallow,
          resetScroll: scroll,
        } as never)
      }

      if (startTransition) {
        startTransition(doNavigate)
      } else {
        doNavigate()
      }
    },
    [navigate, history, shallow, scroll, startTransition]
  )

  // ── Local state (unchanged) ──────────────────────────────────────────────────
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {}
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility ?? {})

  // ── Page ────────────────────────────────────────────────────────────────────
  // nuqs: parseAsInteger.withDefault(1)
  const page =
    typeof search[pageKey] === "number" ? (search[pageKey] as number) : 1

  const setPage = React.useCallback(
    (value: number) => {
      updateSearch((prev) => ({
        ...prev,
        [pageKey]: clearable(value, 1, clearOnDefault),
      }))
    },
    [updateSearch, pageKey, clearOnDefault]
  )

  // ── Global filter / search ───────────────────────────────────────────────────
  // nuqs: parseAsString.withDefault("")
  const globalFilter =
    typeof search[searchKey] === "string" ? (search[searchKey] as string) : ""

  const setGlobalFilter = React.useCallback(
    (updaterOrValue: Updater<string>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(globalFilter)
          : updaterOrValue
      updateSearch((prev) => ({
        ...prev,
        [searchKey]: clearable(next, "", clearOnDefault),
      }))
    },
    [updateSearch, searchKey, globalFilter, clearOnDefault]
  )

  const defaultPerPage = initialState?.pagination?.pageSize ?? 10

  const perPage =
    typeof search[perPageKey] === "number"
      ? (search[perPageKey] as number)
      : defaultPerPage

  const setPerPage = React.useCallback(
    (value: number) => {
      updateSearch((prev) => ({
        ...prev,
        [perPageKey]: clearable(value, defaultPerPage, clearOnDefault),
      }))
    },
    [updateSearch, perPageKey, defaultPerPage, clearOnDefault]
  )

  const pagination: PaginationState = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage,
    }
  }, [page, perPage])

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue
      setPage(newPagination.pageIndex + 1)
      setPerPage(newPagination.pageSize)
    },
    [pagination, setPage, setPerPage]
  )

  // ── Sorting ──────────────────────────────────────────────────────────────────
  // nuqs: getSortingStateParser<TData>(columnIds).withDefault(initialState?.sorting ?? [])
  //
  // TanStack Router stores the array natively — no encode/decode needed.
  // The Zod schema on the route validates shape; here we just read and cast.
  const defaultSorting = initialState?.sorting ?? []

  const sorting = Array.isArray(search[sortKey])
    ? (search[sortKey] as ExtendedColumnSort<TData>[])
    : defaultSorting

  const setSorting = React.useCallback(
    (value: ExtendedColumnSort<TData>[]) => {
      updateSearch((prev) => ({
        ...prev,
        [sortKey]: clearable(value, defaultSorting, clearOnDefault),
        // Reset page on sort change
        [pageKey]: clearable(1, 1, clearOnDefault),
      }))
    },
    [updateSearch, sortKey, pageKey, defaultSorting, clearOnDefault]
  )

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue
      setSorting(next as ExtendedColumnSort<TData>[])
    },
    [sorting, setSorting]
  )

  // ── Per-column filters (basic mode) ──────────────────────────────────────────
  //
  // nuqs used useQueryStates(filterParsers) — a dynamic map of key → parser.
  // We replicate this by reading/writing each column's key directly from search.
  //
  // URL shape:
  //   string columns  → ?name=john          (plain string)
  //   select columns  → ?status=a,b,c       (comma-separated, same as nuqs ARRAY_SEPARATOR)

  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilter) return []
    return columns.filter((column) => column.enableColumnFilter)
  }, [columns, enableAdvancedFilter])

  /**
   * Read current per-column filter values from the URL.
   * Mirrors the filterValues object from useQueryStates(filterParsers).
   */
  const filterValues = React.useMemo<Record<string, string | string[] | null>>(
    () => {
      if (enableAdvancedFilter) return {}

      return filterableColumns.reduce<Record<string, string | string[] | null>>(
        (acc, column) => {
          const key = column.id ?? ""
          const raw = search[key]

          if (raw === undefined || raw === null) {
            acc[key] = null
          } else if (Array.isArray(raw)) {
            // Stored as array natively (select columns)
            acc[key] = raw as string[]
          } else if (typeof raw === "string") {
            // Comma-separated string (mirrors ARRAY_SEPARATOR logic)
            if (column.meta?.options) {
              acc[key] = raw ? raw.split(ARRAY_SEPARATOR).filter(Boolean) : []
            } else {
              acc[key] = raw
            }
          } else {
            acc[key] = null
          }

          return acc
        },
        {}
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterableColumns, search, enableAdvancedFilter]
  )

  /**
   * Write per-column filter values to the URL.
   * Mirrors setFilterValues from useQueryStates.
   *
   * Accepts a partial update map (same shape nuqs accepted):
   *   { name: "john", status: ["active", "pending"], role: null }
   *   null → removes the key (clearOnDefault behaviour)
   */
  const setFilterValues = React.useCallback(
    (updates: Record<string, string | string[] | null>) => {
      updateSearch((prev) => {
        const next = { ...prev }

        for (const [key, value] of Object.entries(updates)) {
          if (
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            // null / empty → remove key (mirrors nuqs clearOnDefault + null)
            delete next[key]
          } else if (Array.isArray(value)) {
            // Select columns — store comma-separated string to keep URLs readable
            // (same as nuqs parseAsArrayOf with ARRAY_SEPARATOR)
            next[key] = value.join(ARRAY_SEPARATOR)
          } else {
            next[key] = value
          }
        }

        return next
      })
    },
    [updateSearch]
  )

  const debouncedSetFilterValues = useDebouncedCallback(
    (values: Record<string, string | string[] | null>) => {
      void setPage(1)
      void setFilterValues(values)
    },
    debounceMs
  )

  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    if (enableAdvancedFilter) return []

    return Object.entries(filterValues).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        if (value !== null) {
          const processedValue = Array.isArray(value)
            ? value
            : typeof value === "string" && /[^a-zA-Z0-9]/.test(value)
              ? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
              : [value]

          filters.push({
            id: key,
            value: processedValue,
          })
        }
        return filters
      },
      []
    )
  }, [filterValues, enableAdvancedFilter])

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilter) return

      setColumnFilters((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue

        const filterUpdates = next.reduce<
          Record<string, string | string[] | null>
        >((acc, filter) => {
          if (filterableColumns.find((column) => column.id === filter.id)) {
            acc[filter.id] = filter.value as string | string[]
          }
          return acc
        }, {})

        for (const prevFilter of prev) {
          if (!next.some((filter) => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null
          }
        }

        debouncedSetFilterValues(filterUpdates)
        return next
      })
    },
    [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter]
  )

  const onGlobalFilterChange = React.useCallback(
    (updaterOrValue: Updater<string>) => {
      setGlobalFilter(updaterOrValue)
      debouncedSetFilterValues({})
    },
    [debouncedSetFilterValues, setGlobalFilter]
  )

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onGlobalFilterChange,
    meta: {
      ...tableProps.meta,
      queryKeys: {
        page: pageKey,
        perPage: perPageKey,
        sort: sortKey,
        search: searchKey,
        filters: filtersKey,
        joinOperator: joinOperatorKey,
      },
    },
  })

  return React.useMemo(
    () => ({ table, shallow, debounceMs, throttleMs }),
    [table, shallow, debounceMs, throttleMs]
  )
}
