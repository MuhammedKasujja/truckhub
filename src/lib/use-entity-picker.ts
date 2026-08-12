import { useState, useEffect, useMemo } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router"

const DEFAULT_SEARCH_DEBOUNCE_MS = 300

// ---- API envelope shapes ----
interface DetailResponse<T> {
  data: T
  message?: string
}

interface Pagination {
  page: number
  perPage: number
  total: number
  hasMore: boolean
}

interface ListResponse<T> {
  data: T[]
  pagination: Pagination
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
  listQueryOptions?: (params: TSearchParams) => UseQueryOptions<ListResponse<T>>

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

  // ---- remote vs local options ----
  const effectiveStaticOptions =
    overrides?.staticOptions ?? config.staticOptions
  const effectiveFilterFn = overrides?.filterFn ?? config.filterFn
  const isLocal = !!effectiveStaticOptions

  const remoteQuery = useQuery({
    ...(config.listQueryOptions?.({
      ...searchParams,
      search: debouncedSearch,
    } as TSearchParams) ?? {
      queryKey: ["__no-list-query__", entityName],
      queryFn: () => Promise.resolve({ data: [], pagination: null } as any),
    }),
    enabled: !isLocal && !!config.listQueryOptions,
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
  const isFetchingMore =
    !isLocal &&
    remoteQuery.isFetching &&
    ((remoteQuery.data as ListResponse<T> | undefined)?.data?.length ?? 0) > 0

  const rawOptions = isLocal
    ? (localQuery.data ?? [])
    : ((remoteQuery.data as ListResponse<T> | undefined)?.data ?? [])

  const pagination = isLocal
    ? null
    : ((remoteQuery.data as ListResponse<T> | undefined)?.pagination ?? null)

  const options = useMemo(() => {
    if (!resolved) return rawOptions
    if (!isLocal && searchParams.search.length > 0) return rawOptions
    const present = rawOptions.some(
      (o) => getOptionValue(o) === getOptionValue(resolved)
    )
    return present ? rawOptions : [resolved, ...rawOptions]
  }, [rawOptions, resolved, searchParams.search, isLocal])

  // typing a new query resets params (fresh page 1 equivalent)
  const setSearch = (query: string) => {
    setSearchParams((prev) =>
      config.buildSearchParams
        ? config.buildSearchParams(config.defaultSearchParams, query)
        : ({ ...config.defaultSearchParams, search: query } as TSearchParams)
    )
  }

  // load more / any other param tweak, without resetting the query text
  const updateSearchParams = (
    updater: (prev: TSearchParams) => TSearchParams
  ) => {
    setSearchParams(updater)
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
    updateSearchParams: isLocal ? undefined : updateSearchParams,
    isFetchingMore,
    hasMore: pagination?.hasMore ?? false,

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
