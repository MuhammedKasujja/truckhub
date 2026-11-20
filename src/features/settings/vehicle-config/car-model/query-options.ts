import { queryOptions } from "@tanstack/react-query"
import { getCarModelsFn } from "./services"
import type { CarModelListSearchParams } from "./schemas"

export const carModelsQueryKeys = {
  all: () => ["car-models"],
  list: () => [...carModelsQueryKeys.all(), "list"],
  details: () => [...carModelsQueryKeys.all(), "detail"],
  detail: (id: string) => [...carModelsQueryKeys.details(), id]as const,
}as const

export const createCarModelsListQueryOptions = ({
  // The make filter is applied on the client; keep it out of the request
  // and the cache key so switching makes doesn't refetch.
  brand: _brand,
  ...search
}: CarModelListSearchParams) =>
  queryOptions({
    queryKey: [...carModelsQueryKeys.list(), search],
    queryFn: () => getCarModelsFn({ data: search }),
  })
