import { getVehiclesFn } from "./services"
import { VehicleListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const vehicleQueryKeys = {
  all: () => ["vehicles"],
  list: () => [...vehicleQueryKeys.all(), "list"],
  details: () => [...vehicleQueryKeys.all(), "detail"],
  detail: (id: string) => [...vehicleQueryKeys.details(), id],
}

export const usersQueryOprions = (search: VehicleListSearchParams) =>
  queryOptions({
    queryKey: [...vehicleQueryKeys.list(), search],
    queryFn: () => getVehiclesFn({ data: search }),
  })
