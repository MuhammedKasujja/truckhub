import { EntityId } from "@/schemas"
import { queryOptions } from "@tanstack/react-query"
import { getIslandListFn, getIslandDetailsFn } from "./services"

export interface IslandSearchParams {
  search: string
  perPage: number
}

export const islandsQueryKeys = {
  all: () => ["islands"] as const,
  list: () => [...islandsQueryKeys.all(), "list"] as const,
  details: () => [...islandsQueryKeys.all(), "detail"] as const,
  filter: () => [...islandsQueryKeys.list(), "filter"] as const,
  detail: (id: string) => [...islandsQueryKeys.details(), id] as const,
} as const

export const islandsQueryOptions = (_: IslandSearchParams) =>
  queryOptions({
    queryKey: islandsQueryKeys.list(),
    queryFn: () => getIslandListFn(),
  })

export const islandListQueryOptions = (params: IslandSearchParams) => ({
  queryKey: [...islandsQueryKeys.filter(), params.search, params.perPage], // no page here
  queryFn: ({ pageParam }: { pageParam: number }) => getIslandListFn(),
  initialPageParam: 1,
})

export const islandDetailsQueryOptions = (islandId: EntityId) =>
  queryOptions({
    queryKey: islandsQueryKeys.detail(islandId),
    queryFn: () => getIslandDetailsFn({ data: { id: islandId } }),
  })
