import { useState, useEffect, useMemo } from "react"
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

export interface EntityPickerConfig<
  T,
  TSearchParams extends { search: string } = { search: string },
> {
  entityName: string

  /** Existing queryOptions factories, returning the RAW envelope —
   *  unwrapped internally via `select`, so cache entries stay identical to
   *  what the rest of the app reads/writes for this entity. */
  detailQueryOptions: (id: string) => UseQueryOptions<DetailResponse<T>>
  /** Returns an infinite-query-shaped config: queryKey WITHOUT page, queryFn
   *  that reads `pageParam`. Reuse your existing API call, just move `page`
   *  from the params object into the queryFn's own argument. */
  listQueryOptions?: (params: TSearchParams) => InfiniteListQueryConfig<T>

  getOptionValue: (item: T) => string

  defaultSearchParams: TSearchParams
  buildSearchParams?: (defaults: TSearchParams, query: string) => TSearchParams
  searchDebounceMs?: number

  mode?: "remote" | "local"
  /** local mode: fixed list, filtered client-side */
  staticOptions?: T[] | (() => Promise<T[]>)
  filterFn?: (option: T, query: string) => boolean

  /** "create new" flow — provide createRoute (page) XOR createMutation (dialog) */
  createRoute?: string
  createMutation?: (data: any) => Promise<T> // mutation returns the bare entity, not an envelope
}

export interface UseEntityPickerOverrides<T> {
  staticOptions?: T[] | (() => Promise<T[]>)
  filterFn?: (option: T, query: string) => boolean
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
  const [searchParams, setSearchParams] = useState<TSearchParams>(
    config.defaultSearchParams
  )
  const debouncedSearch = useDebounce(
    searchParams.search,
    config.searchDebounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS
  )
  const queryClient = useQueryClient()

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
  const effectiveStaticOptions =
    overrides?.staticOptions ?? config.staticOptions
  const effectiveFilterFn = overrides?.filterFn ?? config.filterFn
  const isLocal = !!effectiveStaticOptions

  const effectiveSearchParams = {
    ...searchParams,
    search: debouncedSearch,
  } as TSearchParams
  const listConfig = !isLocal
    ? config.listQueryOptions?.(effectiveSearchParams)
    : undefined

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
      (() => Promise.resolve({ data: [], pagination: null } as any)),
    initialPageParam: listConfig?.initialPageParam ?? 1,
    getNextPageParam: (lastPage: ListResponse<T>) =>
      getHasMore(lastPage.pagination)
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !isLocal && !!listConfig // && debouncedSearch.length > 0,
  })

  const localQuery = useQuery({
    queryKey: ["__local-static__", entityName, typeof effectiveStaticOptions],
    queryFn: () =>
      typeof effectiveStaticOptions === "function"
        ? effectiveStaticOptions()
        : Promise.resolve(effectiveStaticOptions ?? []),
    enabled: isLocal,
    staleTime: Infinity,
  })

  const isFetching = isLocal ? localQuery.isFetching : remoteQuery.isFetching
  const isFetchingMore = !isLocal && remoteQuery.isFetchingNextPage
  const hasMore = !isLocal && remoteQuery.hasNextPage

  // flatten all accumulated pages into one list — this is the actual
  // "infinite scroll" part: each fetchNextPage() call appends a new page
  // rather than replacing the current one
  const rawOptions = isLocal
    ? (localQuery.data ?? [])
    : (remoteQuery.data?.pages.flatMap((page) => page.data) ?? [])

  const options = useMemo(() => {
    if (!resolved) return rawOptions
    if (!isLocal && searchParams.search.length > 0) return rawOptions
    const present = rawOptions.some(
      (o) => getOptionValue(o) === getOptionValue(resolved)
    )
    // Make sure the active option is always included in the list options
    return present ? rawOptions : [resolved, ...rawOptions]
  }, [rawOptions, resolved, searchParams.search, isLocal])

  const setSearch = (query: string) => {
    setSearchParams((_prev) =>
      config.buildSearchParams
        ? config.buildSearchParams(config.defaultSearchParams, query)
        : ({ ...config.defaultSearchParams, search: query } as TSearchParams)
    )
  }

  const fetchMore = () => {
    if (!isLocal) remoteQuery.fetchNextPage()
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
    setSearch: isLocal ? undefined : setSearch,
    fetchMore: isLocal ? undefined : fetchMore,
    isFetchingMore,
    hasMore: hasMore,

    // options
    filterFn: isLocal ? effectiveFilterFn : undefined,
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
