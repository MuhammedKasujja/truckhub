import { getCarModelsFn } from "./services"
import { CarModelListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const carModelsQueryKeys = {
  all: () => ["car-models"],
  list: () => [...carModelsQueryKeys.all(), "list"],
  details: () => [...carModelsQueryKeys.all(), "detail"],
  detail: (id: string) => [...carModelsQueryKeys.details(), id]as const,
}as const

export const createCarModelsListQueryOptions = (
  search: CarModelListSearchParams
) =>
  queryOptions({
    queryKey: [...carModelsQueryKeys.list(), search],
    queryFn: () => getCarModelsFn({ data: search }),
  })
