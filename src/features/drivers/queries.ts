import { EntityId } from "@/types"
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
  edit: (id: EntityId) => [...driverQueryKeys.all(), "edit", id],
  profile: (id: EntityId) => [...driverQueryKeys.all(), "profile", id],
  search: (query?: string) => [...driverQueryKeys.all(), "search-list", query],
}

export function createDriverListQueryOptions(input: DriverListSearchParams) {
  return queryOptions({
    queryKey: [...driverQueryKeys.all(), input],
    queryFn: () => getDriversFn({ data: input }),
  })
}

export function createDriverEditQueryOptions(driverId: EntityId) {
  return queryOptions({
    queryKey: driverQueryKeys.edit(driverId),
    queryFn: () => getDriverByIdFn({ data: { id: driverId } }),
  })
}

export function createDriverProfileQueryOptions(driverId: EntityId) {
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
