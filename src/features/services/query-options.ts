import { ServiceListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getServiceByIdFn, getServicesFn } from "./services"

export const serviceQueryKeys = {
  all: () => ["services"],
  list: () => [...serviceQueryKeys.all(), "list"],
  details: () => [...serviceQueryKeys.all(), "detail"],
  detail: (id: string) => [...serviceQueryKeys.details(), id],
} as const

export const serviceQueryOptions = (search: ServiceListSearchParams) =>
  queryOptions({
    queryKey: [...serviceQueryKeys.list(), search],
    queryFn: () => getServicesFn({ data: search }),
  })

export const serviceDetailsQueryOptions = (serviceId: string) =>
  queryOptions({
    queryKey: serviceQueryKeys.detail(serviceId),
    queryFn: () => getServiceByIdFn({ data: { id: serviceId } }),
  })
