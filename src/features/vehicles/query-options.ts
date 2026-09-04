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
  search: (params: VehicleListSearchParams) => [
    ...vehicleQueryKeys.list(),
    "search",
    params,
  ],
} as const

export const createVehiclesListQueryOptions = (
  search: VehicleListSearchParams
) =>
  queryOptions({
    queryKey: [...vehicleQueryKeys.list(), search],
    queryFn: () => getVehiclesFn({ data: search }),
  })

export const vehicleDetailsQueryOptions = (vehicleId: string) =>
  queryOptions({
    queryKey: vehicleQueryKeys.detail(vehicleId),
    queryFn: () => getVehicleDetailsByIdFn({ data: { id: vehicleId } }),
  })

export const vehicleSearchQueryOptions = (params: VehicleListSearchParams) => ({
  queryKey: vehicleQueryKeys.search(params), // no page here
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getVehiclesByQueryFn({
      data: { ...params, page: pageParam },
    }),
  initialPageParam: 1,
})
