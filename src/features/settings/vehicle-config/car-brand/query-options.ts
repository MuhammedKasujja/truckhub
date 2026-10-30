import { getCarBrandsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { CarBrandListSearchParams } from "./schemas"

export const carBrandQueryKeys = {
  all: () => ["car-brands"] as const,
  list: () => [...carBrandQueryKeys.all(), "list"] as const,
  details: () => [...carBrandQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...carBrandQueryKeys.details(), id] as const,
} as const

export const createCarBrandsQueryOptions = (search: CarBrandListSearchParams) =>
  queryOptions({
    queryKey: [...carBrandQueryKeys.list(), search],
    queryFn: () => getCarBrandsFn({ data: search }),
  })
