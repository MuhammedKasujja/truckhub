import { VehicleListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getVehiclesFn,
  getVehiclesByQueryFn,
  getVehicleDetailsByIdFn,
} from "./services"

export const vehicleQueryKeys = {
  all: () => ["vehicles"],
  list: () => [...vehicleQueryKeys.all(), "list"],
  details: () => [...vehicleQueryKeys.all(), "detail"],
  detail: (id: string) => [...vehicleQueryKeys.details(), id],
  search: (search?: string) => [...vehicleQueryKeys.all(), "search", search],
} as const

export const createVehiclesListQueryOptions = (
  searchParams: VehicleListSearchParams
) =>
  queryOptions({
    queryKey: [...vehicleQueryKeys.list(), searchParams],
    queryFn: () => getVehiclesFn({ data: searchParams }),
  })

export const vehicleDetailsQueryOptions = (vehicleId: string) =>
  queryOptions({
    queryKey: vehicleQueryKeys.detail(vehicleId),
    queryFn: () => getVehicleDetailsByIdFn({ data: { id: vehicleId } }),
  })

export const vehicleSearchQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: vehicleQueryKeys.search(search),
    queryFn: () => getVehiclesByQueryFn({ data: { search } }),
  })
