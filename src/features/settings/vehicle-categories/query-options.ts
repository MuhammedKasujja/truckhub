import { getVehicleCategorysFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { VehicleCategoryListSearchParams } from "./schemas"

export const vehicleTypesQueryKeys = {
  all: () => ["vehicle-types"] as const,
  list: () => [...vehicleTypesQueryKeys.all(), "list"] as const,
  details: () => [...vehicleTypesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...vehicleTypesQueryKeys.details(), id] as const,
} as const

export const createVehicleCategorysQueryOptions = (
  search: VehicleCategoryListSearchParams
) =>
  queryOptions({
    queryKey: [...vehicleTypesQueryKeys.list(), search],
    queryFn: () => getVehicleCategorysFn({ data: { ...search, perPage: 50 } }),
  })
