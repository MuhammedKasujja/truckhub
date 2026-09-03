import { useState, useEffect, useMemo, useRef } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { Pagination } from "@/types"
import { useDebounce } from "@/hooks/use-debounce"
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router"

const DEFAULT_SEARCH_DEBOUNCE_MS = 300

// ---- API envelope shapes ----
interface DetailResponse<T> {
  data: T
  message?: string
}

interface ListResponse<T> {
  data: T[]
  pagination: Pagination
}

/** What an infinite list query needs: a page-stable key, and a queryFn that
 *  accepts the page to fetch. Distinct from a plain UseQueryOptions because
 *  useInfiniteQuery manages pages internally — the queryKey must NOT vary
 *  by page, only by search/filter params. */
interface InfiniteListQueryConfig<T> {
  queryKey: readonly unknown[]
  queryFn: (context: { pageParam: number }) => Promise<ListResponse<T>>
  initialPageParam?: number // default 1
}

const getHasMore = (pagination: Pagination | null) => {
  if (!pagination) return false
  return pagination.page < pagination.totalPages
}

export interface EntityPickerBaseConfig<
  T,
  TSearchParams extends { search: string } = { search: string },
> {
  /** Used to build the `created_${entityName}` return-navigation param. */
  entityName: string

  /** Existing queryOptions factories, returning the RAW envelope —
   *  unwrapped internally via `select`, so cache entries stay identical to
   *  what the rest of the app reads/writes for this entity. */
  detailQueryOptions: (id: string) => UseQueryOptions<DetailResponse<T>>

  getOptionValue: (item: T) => string

  defaultSearchParams: TSearchParams
  buildSearchParams?: (defaults: TSearchParams, query: string) => TSearchParams
  searchDebounceMs?: number

  /** "create new" flow — provide createRoute (page) XOR createMutation (dialog) */
  createRoute?: string
  createMutation?: (data: any) => Promise<T> // mutation returns the bare entity, not an envelope
}

type EntityPickerSearchConfig<T, TSearchParams extends { search: string }> =
  | {
      mode: "remote"
      /** Returns an infinite-query-shaped config: queryKey WITHOUT page, queryFn
       *  that reads `pageParam`. Reuse your existing API call, just move `page`
       *  from the params object into the queryFn's own argument. */
      listQueryOptions: (params: TSearchParams) => InfiniteListQueryConfig<T>
    }
  | {
      mode: "local"
      /** local mode: fixed list, filtered client-side */
      staticOptions: T[] | (() => Promise<T[]>)
      filterFn: (
        option: T,
        query: string,
        filters?: Partial<Omit<TSearchParams, "search">>
      ) => boolean
    }

export type EntityPickerConfig<
  T,
  TSearchParams extends { search: string } = { search: string },
> = EntityPickerBaseConfig<T, TSearchParams> &
  EntityPickerSearchConfig<T, TSearchParams>

export interface UseEntityPickerOverrides<
  T,
  TSearchParams extends { search: string } = { search: string },
> {
  staticOptions?: T[] | (() => Promise<T[]>)
  filterFn?: (
    option: T,
    query: string,
    filters?: Partial<Omit<TSearchParams, "search">>
  ) => boolean
  /** Extra query params beyond the search text — e.g. { status: "active" }.
   *  Persists across keystrokes (unlike `search`, which resets on every
   *  new typed query), but changing `filters` itself resets pagination —
   *  a different filter value means a different result set, same as a
   *  new search would. */
  filters?: Partial<Omit<TSearchParams, "search">>
}

/** Stable stringified key for shallow-comparing a filters object across
 *  renders, so the sync effect only fires when the actual VALUES change,
 *  not on every render where a caller passes a fresh object literal. */
function useStableFiltersKey(filters: Record<string, unknown> | undefined) {
  return useMemo(() => JSON.stringify(filters ?? {}), [filters])
}

export function useEntityPicker<
  T,
  TSearchParams extends { search: string } = { search: string },
>(
  config: EntityPickerConfig<T, TSearchParams>,
  value: T | string | null | undefined,
  onChange: (value: T | null) => void,
  overrides?: UseEntityPickerOverrides<T>
) {
  const { entityName, getOptionValue } = config

  const filters = overrides?.filters
  const filtersKey = useStableFiltersKey(
    filters as Record<string, unknown> | undefined
  )

  const [searchParams, setSearchParams] = useState<TSearchParams>({
    ...config.defaultSearchParams,
    ...filters,
  })

  const debouncedSearch = useDebounce(
    searchParams.search,
    config.searchDebounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS
  )
  const queryClient = useQueryClient()

  // Re-apply filters into searchParams whenever their VALUES change (not
  // identity — filtersKey is a stable stringified comparison). Preserves
  // whatever search text is currently typed; only the filter fields update.
  // This is what makes changing `filters` reset pagination — it produces a
  // new searchParams object, which (for remote mode) changes the query key.
  const prevFiltersKeyRef = useRef(filtersKey)
  useEffect(() => {
    if (prevFiltersKeyRef.current === filtersKey) return
    prevFiltersKeyRef.current = filtersKey
    setSearchParams((prev) => ({ ...prev, ...filters }) as TSearchParams)
  }, [filtersKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- resolve a bare id into a full object ----
  const idToResolve = typeof value === "string" ? value : null

  const { data: resolved, isLoading: isResolvingQuery } = useQuery({
    ...config.detailQueryOptions(idToResolve!),
    select: (res: DetailResponse<T>) => res.data, // unwrap envelope -> T
    enabled: !!idToResolve,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (
      resolved &&
      typeof value === "string" &&
      value === getOptionValue(resolved)
    ) {
      onChange(resolved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved])

  // ---- remote (infinite) vs local options ----
  const isLocal = config.mode === "local"

  const effectiveStaticOptions = isLocal
    ? (overrides?.staticOptions ?? config.staticOptions)
    : overrides?.staticOptions // escape hatch: force local behavior on a remote config

  const effectiveFilterFn = isLocal
    ? (overrides?.filterFn ?? config.filterFn)
    : overrides?.filterFn

  const isEffectivelyLocal = !!effectiveStaticOptions

  const listConfig =
    !isEffectivelyLocal && config.mode === "remote"
      ? config.listQueryOptions({
          ...searchParams,
          search: debouncedSearch,
        } as TSearchParams)
      : undefined

  const shouldFetchRemote = !isEffectivelyLocal && !!listConfig //&& (config.fetchOnOpen ? isOpen : debouncedSearch.length > 0)

  // const remoteQuery = useQuery({
  //   ...(config.listQueryOptions?.({
  //     ...searchParams,
  //     search: debouncedSearch,
  //   } as TSearchParams) ?? {
  //     queryKey: ["__no-list-query__", entityName],
  //     queryFn: () => Promise.resolve({ data: [], pagination: null } as any),
  //   }),
  //   enabled: !isLocal && !!config.listQueryOptions,
  // })

  const remoteQuery = useInfiniteQuery({
    queryKey: listConfig?.queryKey ?? ["__no-list-query__", entityName],
    queryFn:
      listConfig?.queryFn ??
      (() =>
        Promise.resolve({
          data: [],
          pagination: null,
        } as unknown as ListResponse<T>)),
    initialPageParam: listConfig?.initialPageParam ?? 1,
    getNextPageParam: (lastPage: ListResponse<T>) =>
      getHasMore(lastPage.pagination)
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: shouldFetchRemote,
  })

  const localQuery = useQuery({
    queryKey: ["__local-static__", entityName, typeof effectiveStaticOptions],
    queryFn: () =>
      typeof effectiveStaticOptions === "function"
        ? effectiveStaticOptions()
        : Promise.resolve(effectiveStaticOptions ?? []),
    enabled: isEffectivelyLocal,
    staleTime: Infinity,
  })

  const isFetching = isEffectivelyLocal
    ? localQuery.isFetching
    : remoteQuery.isFetching
  const isFetchingMore = !isEffectivelyLocal && remoteQuery.isFetchingNextPage
  const hasMore = !isEffectivelyLocal && remoteQuery.hasNextPage

  // flatten all accumulated pages into one list — this is the actual
  // "infinite scroll" part: each fetchNextPage() call appends a new page
  // rather than replacing the current one
  const rawOptions = isEffectivelyLocal
    ? (localQuery.data ?? [])
    : (remoteQuery.data?.pages.flatMap((page) => page.data) ?? [])

  const options = useMemo(() => {
    if (!resolved) return rawOptions
    if (!isEffectivelyLocal && searchParams.search.length > 0) return rawOptions
    const present = rawOptions.some(
      (o) => getOptionValue(o) === getOptionValue(resolved)
    )
    // Make sure the active option is always included in the list options
    return present ? rawOptions : [resolved, ...rawOptions]
  }, [rawOptions, resolved, searchParams.search, isEffectivelyLocal])

  // typing a new query resets to defaults + swaps search, then re-applies
  // active filters (filters must survive a text-search reset)
  const setSearch = (query: string) => {
    setSearchParams((_prev) => {
      const base = config.buildSearchParams
        ? config.buildSearchParams(config.defaultSearchParams, query)
        : ({ ...config.defaultSearchParams, search: query } as TSearchParams)
      return { ...base, ...filters } as TSearchParams
    })
  }

  const fetchMore = () => {
    if (!isEffectivelyLocal) remoteQuery.fetchNextPage()
  }

  // ---- create flow: dialog (createMutation) or page (createRoute) ----
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prefill, setPrefill] = useState("")

  const mutation = useMutation({
    mutationFn: config.createMutation!,
    onSuccess: (created) => {
      // seed the SAME key detailQueryOptions uses, wrapped in the envelope
      // shape that key's consumers (including this hook) expect back
      queryClient.setQueryData(
        config.detailQueryOptions(getOptionValue(created)).queryKey!,
        { data: created } as DetailResponse<T>
      )
      onChange(created)
      setDialogOpen(false)
    },
  })

  const navigate = useNavigate()
  const router = useRouter()
  const routeSearch = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >
  const createdId = routeSearch[`created_${entityName}`]

  useEffect(() => {
    if (!config.createRoute || !createdId) return

    const cached = queryClient.getQueryData<DetailResponse<T>>(
      config.detailQueryOptions(createdId).queryKey!
    )
    if (cached) onChange(cached.data)

    navigate({
      search: (prev: any) => {
        const { [`created_${entityName}`]: _drop, ...rest } = prev
        return rest
      },
      replace: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdId])

  const triggerCreate = (prefillValue: string) => {
    if (config.createRoute) {
      navigate({
        to: config.createRoute,
        search: {
          prefill: prefillValue,
          returnTo:
            router.state.location.pathname + router.state.location.searchStr,
          field: entityName,
        },
      })
    } else if (config.createMutation) {
      setPrefill(prefillValue)
      setDialogOpen(true)
    }
  }

  return {
    // search / pagination
    search: searchParams.search,
    searchParams,
    setSearch: isEffectivelyLocal ? undefined : setSearch,
    fetchMore: isEffectivelyLocal ? undefined : fetchMore,
    isFetchingMore,
    hasMore: hasMore,

    // options
    filterFn: isEffectivelyLocal
      ? (option: T, query: string) => effectiveFilterFn!(option, query, filters)
      : undefined,
    options,
    isFetching,
    resolved,
    isResolving: !!idToResolve && isResolvingQuery,

    // selection
    isSelected: (option: T) => {
      if (value == null) return false
      const key = typeof value === "string" ? value : getOptionValue(value)
      return getOptionValue(option) === key
    },

    // create flow
    canCreate: !!(config.createRoute || config.createMutation),
    triggerCreate,
    createDialog: {
      open: dialogOpen,
      setOpen: setDialogOpen,
      prefill,
      submitting: mutation.isPending,
      submit: (data: any) => mutation.mutate(data),
    },
  }
}
