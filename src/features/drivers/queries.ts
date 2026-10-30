import { EntityId } from "@/schemas"
import { DriverListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getDriversFn,
  getDriverByIdFn,
  getDriverProfileFn,
  getDriversByQueryFn,
} from "./services"

export const driverQueryKeys = {
  all: () => ["drivers"],
  list: () => [...driverQueryKeys.all(), "list"],
  details: () => [...driverQueryKeys.all(), "details"],
  detail: (id: EntityId) => [...driverQueryKeys.all(), "details", id],
  edit: (id: EntityId) => [...driverQueryKeys.detail(id), "edit"],
  profile: (id: EntityId) => [...driverQueryKeys.detail(id), "profile"],
  search: (query?: string) => [...driverQueryKeys.all(), "search-list", query],
} as const

export function createDriverListQueryOptions(input: DriverListSearchParams) {
  return queryOptions({
    queryKey: [...driverQueryKeys.list(), input],
    queryFn: () => getDriversFn({ data: input }),
  })
}

export function createDriverEditQueryOptions(driverId: EntityId) {
  return queryOptions({
    queryKey: driverQueryKeys.edit(driverId),
    queryFn: () => getDriverByIdFn({ data: { id: driverId } }),
  })
}

export function driverProfileQueryOptions(driverId: EntityId) {
  return queryOptions({
    queryKey: driverQueryKeys.profile(driverId),
    queryFn: () => getDriverProfileFn({ data: { id: driverId } }),
  })
}

export function createDriverSearchQueryOptions(search?: string) {
  return queryOptions({
    queryKey: driverQueryKeys.search(search),
    queryFn: () => getDriversByQueryFn({ data: { search } }),
  })
}
