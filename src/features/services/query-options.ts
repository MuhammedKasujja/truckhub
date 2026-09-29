import { queryOptions } from "@tanstack/react-query"
import {
  getServicesFn,
  getServiceByIdFn,
  getServicesByQueryFn,
} from "./services"
import { EntityId } from "@/schemas"

export const serviceQueryKeys = {
  all: () => ["services"],
  list: () => [...serviceQueryKeys.all(), "list"],
  details: () => [...serviceQueryKeys.all(), "detail"],
  search: () => [...serviceQueryKeys.list(), "search"],
  detail: (id: EntityId) => [...serviceQueryKeys.details(), id],
} as const

export const serviceQueryOptions = () =>
  queryOptions({
    queryKey: [...serviceQueryKeys.list()],
    queryFn: () => getServicesFn(),
    staleTime: 60 * 60 * 1000, // state for 1 hour
  })

export const servicesSearchQueryOptions = () =>
  queryOptions({
    queryKey: serviceQueryKeys.search(),
    queryFn: () => getServicesByQueryFn({ data: {} }),
  })

export const serviceDetailsQueryOptions = (serviceId: string) =>
  queryOptions({
    queryKey: serviceQueryKeys.detail(serviceId),
    queryFn: () => getServiceByIdFn({ data: { id: serviceId } }),
  })
