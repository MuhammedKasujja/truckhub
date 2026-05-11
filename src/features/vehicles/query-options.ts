import { getVehiclesFn } from "./services"
import { VehicleListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const vehicleQueryKeys = {
  all: () => ["vehicles"],
  list: () => [...vehicleQueryKeys.all(), "list"],
  details: () => [...vehicleQueryKeys.all(), "detail"],
  detail: (id: string) => [...vehicleQueryKeys.details(), id],
}

export const createVehiclesListQueryOptions = (
  searchParams: VehicleListSearchParams
) =>
  queryOptions({
    queryKey: [...vehicleQueryKeys.list(), searchParams],
    queryFn: () => getVehiclesFn({ data: searchParams }),
  })
