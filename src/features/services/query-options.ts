import { getServicesFn } from "./services"
import { ServiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const serviceQueryKeys = {
  all: () => ["services"],
  list: () => [...serviceQueryKeys.all(), "list"],
  details: () => [...serviceQueryKeys.all(), "detail"],
  detail: (id: string) => [...serviceQueryKeys.details(), id],
}

export const serviceQueryOprions = (search: ServiceListSearchParams) =>
  queryOptions({
    queryKey: [...serviceQueryKeys.list(), search],
    queryFn: () => getServicesFn({ data: search }),
  })
