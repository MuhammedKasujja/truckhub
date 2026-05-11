import { getVehicleTypesFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { VehicleTypeListSearchParams } from "./schemas"

export const vehicleTypesQueryKeys = {
  all: () => ["vehicle-types"] as const,
  list: () => [...vehicleTypesQueryKeys.all(), "list"] as const,
  details: () => [...vehicleTypesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...vehicleTypesQueryKeys.details(), id] as const,
} as const

export const createVehicleTypesQueryOptions = (
  search: VehicleTypeListSearchParams
) =>
  queryOptions({
    queryKey: [...vehicleTypesQueryKeys.list(), search],
    queryFn: () => getVehicleTypesFn({ data: search }),
  })
