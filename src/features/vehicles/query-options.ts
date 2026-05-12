import { VehicleListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getVehicleDetailsByIdFn, getVehiclesFn } from "./services"

export const vehicleQueryKeys = {
  all: () => ["vehicles"],
  list: () => [...vehicleQueryKeys.all(), "list"],
  details: () => [...vehicleQueryKeys.all(), "detail"],
  detail: (id: string) => [...vehicleQueryKeys.details(), id],
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
