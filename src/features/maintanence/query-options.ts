import { queryOptions } from "@tanstack/react-query"
import { getMaintenanceBoardViewFn } from "./services"
import { MaintenanceSearchParamsInput } from "./schemas"

export const maintenanceQueryKeys = {
  all: () => ["maintenance"],
  list: () => [...maintenanceQueryKeys.all(), "list"],
  board: () => [...maintenanceQueryKeys.list(), "board"],
  boardView: (search: MaintenanceSearchParamsInput) => [
    ...maintenanceQueryKeys.list(),
    "board",
    search,
  ],
} as const

export const maintenanceBoardQueryOptions = (
  data: MaintenanceSearchParamsInput
) =>
  queryOptions({
    queryKey: maintenanceQueryKeys.boardView(data),
    queryFn: () => getMaintenanceBoardViewFn({ data }),
  })
