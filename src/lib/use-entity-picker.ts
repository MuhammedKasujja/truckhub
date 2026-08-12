import { useState, useEffect, useMemo } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router"

export interface EntityPickerConfig<
  T,
  TSearchParams extends { search: string } = { search: string },
> {
  entityName: string

  /** Your existing queryOptions factories — reused as-is, same cache entries as everywhere else. */
  detailQueryOptions: (id: string) => UseQueryOptions<T>
  listQueryOptions: (params: TSearchParams) => UseQueryOptions<T[]>
  searchDebounceMs?: number

  getOptionValue: (item: T) => string

  /** Starting params for remote search (e.g. { search: "", perPage: 50 }). */
  defaultSearchParams: TSearchParams
  /** Override how a new typed query resets params (default: spread defaults + swap `search`). */
  buildSearchParams?: (defaults: TSearchParams, query: string) => TSearchParams

  mode?: "remote" | "local"
  /** local mode: fixed list, filtered client-side */
  staticOptions?: T[] | (() => Promise<T[]>)
  filterFn?: (option: T, query: string) => boolean

  /** "create new" flow — provide createRoute (page) XOR createMutation (dialog) */
  createRoute?: string
  createMutation?: (data: any) => Promise<T>
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
    config.searchDebounceMs ?? 300
  )
  const queryClient = useQueryClient()

  // ---- resolve a bare id into a full object ----
  const idToResolve = typeof value === "string" ? value : null

  const { data: resolved } = useQuery({
    ...config.detailQueryOptions(idToResolve!),
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
    ...config.listQueryOptions({ ...searchParams, search: debouncedSearch }),
    enabled: !isLocal, // && searchParams.search.length > 0,
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
    !isLocal && remoteQuery.isFetching && (remoteQuery.data?.length ?? 0) > 0
  const rawOptions = isLocal
    ? (localQuery.data ?? [])
    : (remoteQuery?.data?.data ?? [])

  const options = useMemo(() => {
    console.log("rawOptions", rawOptions, "resolved", resolved)
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
      queryClient.setQueryData(
        config.detailQueryOptions(getOptionValue(created)).queryKey!,
        created
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

    const cached = queryClient.getQueryData<T>(
      config.detailQueryOptions(createdId).queryKey!
    )
    if (cached) onChange(cached)

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

    // options
    filterFn: isLocal ? effectiveFilterFn : undefined,
    options,
    isFetching,
    resolved,

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
